// Compass client-side PDF report generator (pdf-lib), ported from the Claidex
// app. Runs in the browser only. Produces a clinical trial report with native,
// fillable PDF form fields for human-entered values (patient name, DOB,
// provider, NPI). Patient clinical data is pre-filled from the in-session chat.
// Nothing is persisted: the caller turns the returned bytes into a Blob URL.

import {
    PDFDocument,
    type PDFFont,
    type PDFForm,
    type PDFPage,
    rgb,
    StandardFonts,
} from 'pdf-lib'

import type { CompassPdfData, CompassPdfTrial } from './compassTypes'

const MARGIN = 40
const PAGE_W = 612 // US Letter
const PAGE_H = 792
const INK = rgb(0.09, 0.09, 0.09)
const MUTED = rgb(0.42, 0.42, 0.42)
const LINE = rgb(0.8, 0.8, 0.8)
const PANEL = rgb(0.96, 0.96, 0.96)

interface Ctx {
    doc: PDFDocument
    form: PDFForm
    font: PDFFont
    bold: PDFFont
    page: PDFPage
    y: number
    fieldSeq: number
    pageNo: number
}

function drawFooter(ctx: Ctx): void {
    const label = 'Claidex Compass · Clinical Trial Navigation Report'
    ctx.page.drawLine({
        start: { x: MARGIN, y: MARGIN - 8 },
        end: { x: PAGE_W - MARGIN, y: MARGIN - 8 },
        thickness: 0.5,
        color: LINE,
    })
    ctx.page.drawText(label, {
        x: MARGIN,
        y: MARGIN - 20,
        size: 7.5,
        font: ctx.font,
        color: MUTED,
    })
    const num = `${ctx.pageNo}`
    ctx.page.drawText(num, {
        x: PAGE_W - MARGIN - ctx.font.widthOfTextAtSize(num, 7.5),
        y: MARGIN - 20,
        size: 7.5,
        font: ctx.font,
        color: MUTED,
    })
}

function newPage(ctx: Ctx): void {
    ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H])
    ctx.pageNo += 1
    ctx.y = PAGE_H - MARGIN
    drawFooter(ctx)
}

function ensureSpace(ctx: Ctx, needed: number): void {
    if (ctx.y - needed < MARGIN) newPage(ctx)
}

function wrap(
    text: string,
    font: PDFFont,
    size: number,
    maxWidth: number
): string[] {
    const words = (text ?? '').replace(/\s+/g, ' ').trim().split(' ')
    const lines: string[] = []
    let line = ''
    for (const word of words) {
        const candidate = line ? `${line} ${word}` : word
        if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
            lines.push(line)
            line = word
        } else {
            line = candidate
        }
    }
    if (line) lines.push(line)
    return lines.length ? lines : ['']
}

function drawParagraph(
    ctx: Ctx,
    text: string,
    opts: {
        size?: number
        font?: PDFFont
        color?: ReturnType<typeof rgb>
        indent?: number
        gap?: number
    } = {}
): void {
    const size = opts.size ?? 10
    const font = opts.font ?? ctx.font
    const color = opts.color ?? INK
    const indent = opts.indent ?? 0
    const maxWidth = PAGE_W - MARGIN * 2 - indent
    for (const line of wrap(text, font, size, maxWidth)) {
        ensureSpace(ctx, size + 4)
        ctx.page.drawText(line, {
            x: MARGIN + indent,
            y: ctx.y - size,
            size,
            font,
            color,
        })
        ctx.y -= size + (opts.gap ?? 4)
    }
}

function divider(ctx: Ctx): void {
    ensureSpace(ctx, 14)
    ctx.y -= 6
    ctx.page.drawLine({
        start: { x: MARGIN, y: ctx.y },
        end: { x: PAGE_W - MARGIN, y: ctx.y },
        thickness: 0.75,
        color: LINE,
    })
    ctx.y -= 10
}

function sanitizeFieldName(raw: string, seq: number): string {
    return `${raw.replace(/[^a-zA-Z0-9_]/g, '_')}_${seq}`
}

function addTextField(
    ctx: Ctx,
    label: string,
    prefill: string,
    opts: { width?: number } = {}
): void {
    const size = 10
    const labelWidth = 130
    const fieldHeight = 16
    ensureSpace(ctx, fieldHeight + 8)
    const rowY = ctx.y - fieldHeight
    ctx.page.drawText(label, {
        x: MARGIN + 8,
        y: rowY + 4,
        size,
        font: ctx.bold,
        color: INK,
    })
    const fieldX = MARGIN + 8 + labelWidth
    const fieldW = opts.width ?? PAGE_W - MARGIN * 2 - 16 - labelWidth
    const field = ctx.form.createTextField(
        sanitizeFieldName(label, ctx.fieldSeq++)
    )
    if (prefill) field.setText(prefill)
    field.addToPage(ctx.page, {
        x: fieldX,
        y: rowY,
        width: fieldW,
        height: fieldHeight,
        borderWidth: 0,
        backgroundColor: rgb(1, 1, 1),
        textColor: INK,
    })
    ctx.page.drawLine({
        start: { x: fieldX, y: rowY },
        end: { x: fieldX + fieldW, y: rowY },
        thickness: 0.5,
        color: LINE,
    })
    ctx.y -= fieldHeight + 8
}

function cleanList(items: string[] | undefined): string {
    if (!items || items.length === 0) return 'Not specified'
    return items.filter(Boolean).join(', ') || 'Not specified'
}

function trialPage(
    ctx: Ctx,
    trial: CompassPdfTrial,
    index: number,
    total: number
): void {
    newPage(ctx)
    ctx.page.drawRectangle({
        x: MARGIN,
        y: ctx.y - 16,
        width: 86,
        height: 18,
        color: PANEL,
    })
    ctx.page.drawText(`Trial ${index + 1} of ${total}`, {
        x: MARGIN + 8,
        y: ctx.y - 12,
        size: 9,
        font: ctx.bold,
        color: MUTED,
    })
    ctx.y -= 30

    drawParagraph(ctx, trial.title || trial.nctId, {
        size: 14,
        font: ctx.bold,
        gap: 6,
    })
    drawParagraph(
        ctx,
        `${trial.nctId} | Phase ${trial.phase || 'N/A'} | ${
            trial.sponsor || 'Sponsor not listed'
        }`,
        { size: 10, color: MUTED, gap: 8 }
    )
    divider(ctx)

    drawParagraph(ctx, 'WHY THIS PATIENT MAY QUALIFY', {
        size: 11,
        font: ctx.bold,
        gap: 6,
    })
    const reasons = trial.qualificationReasons?.length
        ? trial.qualificationReasons
        : ['Eligibility to be confirmed by the trial site.']
    for (const reason of reasons)
        drawParagraph(ctx, `-  ${reason}`, { size: 10, indent: 8 })
    ctx.y -= 4

    drawParagraph(ctx, 'LOGISTICS', { size: 11, font: ctx.bold, gap: 6 })
    const site = trial.nearestSite
    const siteText = site
        ? `${[site.city, site.state].filter(Boolean).join(', ') || 'Location not listed'}${
              site.distanceMiles != null
                  ? ` (${site.distanceMiles} miles from patient)`
                  : ''
          }`
        : 'Distance calculation unavailable'
    drawParagraph(ctx, `-  Nearest site: ${siteText}`, { size: 10, indent: 8 })
    drawParagraph(
        ctx,
        `-  Telehealth visits: ${trial.telehealth ? 'Mentioned' : 'Not listed'}`,
        { size: 10, indent: 8 }
    )
    drawParagraph(
        ctx,
        `-  Home drug delivery: ${trial.homeDelivery ? 'Mentioned' : 'Not specified'}`,
        { size: 10, indent: 8 }
    )
    ctx.y -= 4

    drawParagraph(ctx, 'FAILURE HISTORY (CLAIDEX)', {
        size: 11,
        font: ctx.bold,
        gap: 6,
    })
    const mrsText =
        trial.claidexMRS != null
            ? `MRS ${trial.claidexMRS}/100. ${trial.claidexContext || ''}`.trim()
            : trial.claidexContext ||
              'No prior failure data in Claidex for this target.'
    drawParagraph(ctx, mrsText, { size: 10, indent: 8 })
    ctx.y -= 4

    drawParagraph(ctx, 'CONTACT', { size: 11, font: ctx.bold, gap: 6 })
    const contact =
        [trial.contactName, trial.contactEmail, trial.contactPhone]
            .filter(Boolean)
            .join('  |  ') || 'See trial record'
    drawParagraph(ctx, contact, { size: 10, indent: 8 })
}

/** Generate the Compass trial report as PDF bytes (Uint8Array). */
export async function generateCompassPdf(
    data: CompassPdfData
): Promise<Uint8Array> {
    const doc = await PDFDocument.create()
    doc.setTitle('Claidex Compass Clinical Trial Report')
    doc.setProducer('Claidex Compass')
    doc.setCreator('Claidex Compass')

    const font = await doc.embedFont(StandardFonts.Helvetica)
    const bold = await doc.embedFont(StandardFonts.HelveticaBold)
    const form = doc.getForm()

    const ctx: Ctx = {
        doc,
        form,
        font,
        bold,
        page: doc.addPage([PAGE_W, PAGE_H]),
        y: PAGE_H - MARGIN,
        fieldSeq: 0,
        pageNo: 1,
    }
    drawFooter(ctx)

    // -- Cover / header --
    drawParagraph(ctx, 'Clinical Trial Navigation Report', {
        size: 20,
        font: bold,
        gap: 6,
    })
    drawParagraph(ctx, 'Prepared by Claidex Compass for clinical use', {
        size: 10,
        color: MUTED,
        gap: 6,
    })
    const reportDate = (data.generatedAt || '').slice(0, 10) || '-'
    drawParagraph(ctx, `Date: ${reportDate}`, {
        size: 10,
        color: MUTED,
        gap: 8,
    })
    divider(ctx)

    // -- Patient profile panel --
    drawParagraph(ctx, 'PATIENT PROFILE', { size: 12, font: bold, gap: 8 })
    const patient = data.patient
    addTextField(ctx, 'Patient Name:', patient.name ?? '')
    addTextField(ctx, 'Date of Birth:', '')
    addTextField(ctx, 'Diagnosis:', patient.condition ?? '')
    addTextField(ctx, 'Biomarkers:', cleanList(patient.biomarkers))
    addTextField(ctx, 'Prior Treatments:', cleanList(patient.priorTreatments))
    addTextField(ctx, 'Age / Sex:', [patient.age, patient.sex].filter(Boolean).join(' / '))
    addTextField(ctx, 'Location:', patient.location ?? '')
    addTextField(ctx, 'Provider Name:', '')
    addTextField(ctx, 'Provider NPI:', '')
    addTextField(ctx, 'Date of Report:', reportDate)

    // -- One page per trial --
    const trials = Array.isArray(data.trials) ? data.trials : []
    trials.forEach((trial, i) => {
        trialPage(ctx, trial, i, trials.length)
    })

    // -- Disclaimer page --
    newPage(ctx)
    drawParagraph(ctx, 'DISCLAIMER', { size: 12, font: bold, gap: 8 })
    divider(ctx)
    drawParagraph(
        ctx,
        'This report was generated by Claidex Compass, an AI-powered clinical trial navigation tool. It is intended to support clinical decision-making, not replace it. Trial eligibility must be confirmed by the trial site. All patient data used to generate this report was processed in-session and has not been stored or transmitted to any third party.',
        { size: 10, color: INK, gap: 6 }
    )

    return doc.save()
}
