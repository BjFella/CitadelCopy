#!/usr/bin/env python3
"""Render Citadel's submission support packet as a polished 16:9 PDF."""

from __future__ import annotations

import math
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "citadel-sentient-grant-packet.pdf"
ASSETS = ROOT / "docs" / "assets" / "application"

PAGE_W = 960
PAGE_H = 540
MARGIN = 54

INK = HexColor("#F4FAFF")
MUTED = HexColor("#A7BCD0")
FAINT = HexColor("#6E8BA3")
NAVY = HexColor("#061523")
NAVY_2 = HexColor("#0A2034")
CARD = HexColor("#102B43")
CARD_2 = HexColor("#151F49")
LINE = HexColor("#23516C")
CYAN = HexColor("#3EDDF2")
BLUE = HexColor("#6B9CFF")
GREEN = HexColor("#5DE3A1")
AMBER = HexColor("#F4BE67")
VIOLET = HexColor("#9D8CFF")
RED = HexColor("#FF8C8C")


def set_alpha(pdf: canvas.Canvas, fill: float | None = None, stroke: float | None = None) -> None:
    if fill is not None and hasattr(pdf, "setFillAlpha"):
        pdf.setFillAlpha(fill)
    if stroke is not None and hasattr(pdf, "setStrokeAlpha"):
        pdf.setStrokeAlpha(stroke)


def background(pdf: canvas.Canvas, page: int, section: str) -> None:
    pdf.setFillColor(NAVY)
    pdf.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    set_alpha(pdf, fill=0.14)
    pdf.setFillColor(CYAN)
    pdf.circle(PAGE_W - 20, PAGE_H + 40, 190, fill=1, stroke=0)
    pdf.setFillColor(VIOLET)
    pdf.circle(PAGE_W - 50, -80, 210, fill=1, stroke=0)
    set_alpha(pdf, fill=1)

    set_alpha(pdf, stroke=0.28)
    pdf.setStrokeColor(LINE)
    pdf.setLineWidth(0.45)
    for x in range(0, PAGE_W + 1, 48):
        pdf.line(x, 0, x, PAGE_H)
    for y in range(0, PAGE_H + 1, 48):
        pdf.line(0, y, PAGE_W, y)
    set_alpha(pdf, stroke=1)

    pdf.setFillColor(CARD)
    pdf.roundRect(31, PAGE_H - 57, 28, 28, 8, fill=1, stroke=0)
    pdf.setStrokeColor(CYAN)
    pdf.setLineWidth(0.8)
    pdf.roundRect(31, PAGE_H - 57, 28, 28, 8, fill=0, stroke=1)
    pdf.setFillColor(CYAN)
    pdf.setFont("Courier-Bold", 12)
    pdf.drawCentredString(45, PAGE_H - 48, "C")
    pdf.setFillColor(INK)
    pdf.setFont("Courier-Bold", 11)
    pdf.drawString(69, PAGE_H - 49, "CITADEL")

    pdf.setFillColor(FAINT)
    pdf.setFont("Courier", 7.5)
    pdf.drawRightString(PAGE_W - 33, PAGE_H - 47, section.upper())
    pdf.drawString(33, 19, "SENTIENT OPEN SOURCE AGI GRANT - SUPPORTING DOCUMENT")
    pdf.drawRightString(PAGE_W - 33, 19, f"{page:02d} / 08")


def wrap_lines(text: str, font: str, size: float, width: float) -> list[str]:
    lines: list[str] = []
    for raw in text.splitlines() or [""]:
        words = raw.split()
        if not words:
            lines.append("")
            continue
        current = words[0]
        for word in words[1:]:
            candidate = f"{current} {word}"
            if stringWidth(candidate, font, size) <= width:
                current = candidate
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return lines


def text_block(
    pdf: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    size: float = 14,
    leading: float | None = None,
    color=INK,
    font: str = "Helvetica",
    max_lines: int | None = None,
) -> float:
    line_height = leading or size * 1.35
    lines = wrap_lines(text, font, size, width)
    if max_lines is not None:
        lines = lines[:max_lines]
    pdf.setFillColor(color)
    pdf.setFont(font, size)
    cursor = y
    for line in lines:
        pdf.drawString(x, cursor, line)
        cursor -= line_height
    return cursor


def eyebrow(pdf: canvas.Canvas, text: str, x: float, y: float, color=CYAN) -> None:
    pdf.setFillColor(color)
    pdf.setFont("Courier-Bold", 9)
    pdf.drawString(x, y, text.upper())


def title(pdf: canvas.Canvas, text: str, x: float, y: float, width: float, size: float = 34) -> float:
    return text_block(pdf, text, x, y, width, size=size, leading=size * 1.05, color=INK, font="Helvetica-Bold")


def card(pdf: canvas.Canvas, x: float, y: float, w: float, h: float, accent=CYAN, fill=CARD) -> None:
    pdf.setFillColor(fill)
    set_alpha(pdf, fill=0.94)
    pdf.roundRect(x, y, w, h, 14, fill=1, stroke=0)
    set_alpha(pdf, fill=1)
    pdf.setStrokeColor(LINE)
    pdf.setLineWidth(0.8)
    pdf.roundRect(x, y, w, h, 14, fill=0, stroke=1)
    pdf.setFillColor(accent)
    pdf.roundRect(x, y, 4, h, 2, fill=1, stroke=0)


def metric(pdf: canvas.Canvas, x: float, y: float, w: float, value: str, label: str, color=GREEN) -> None:
    pdf.setFillColor(color)
    pdf.setFont("Courier-Bold", 18)
    pdf.drawString(x, y, value)
    text_block(pdf, label, x, y - 18, w, size=8.5, leading=11, color=MUTED, font="Courier")


def bullet(pdf: canvas.Canvas, text: str, x: float, y: float, width: float, color=CYAN, size: float = 11.5) -> float:
    pdf.setFillColor(color)
    pdf.circle(x + 4, y + 3, 2.3, fill=1, stroke=0)
    return text_block(pdf, text, x + 15, y + 8, width - 15, size=size, leading=size * 1.38, color=INK) - 8


def label(pdf: canvas.Canvas, text: str, x: float, y: float, color=AMBER) -> None:
    width = stringWidth(text.upper(), "Courier-Bold", 7.5) + 18
    pdf.setFillColor(CARD_2)
    pdf.roundRect(x, y - 3, width, 18, 9, fill=1, stroke=0)
    pdf.setStrokeColor(color)
    pdf.setLineWidth(0.6)
    pdf.roundRect(x, y - 3, width, 18, 9, fill=0, stroke=1)
    pdf.setFillColor(color)
    pdf.setFont("Courier-Bold", 7.5)
    pdf.drawString(x + 9, y + 2, text.upper())


def fit_image(pdf: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float) -> None:
    image = ImageReader(str(path))
    iw, ih = image.getSize()
    scale = min(w / iw, h / ih)
    dw = iw * scale
    dh = ih * scale
    pdf.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, preserveAspectRatio=True, mask="auto")


def source(pdf: canvas.Canvas, text: str) -> None:
    pdf.setFillColor(FAINT)
    pdf.setFont("Courier", 6.8)
    pdf.drawString(MARGIN, 35, text)


def slide_1(pdf: canvas.Canvas) -> None:
    background(pdf, 1, "The proposal")
    eyebrow(pdf, "Sentient Token and Economic Optimization for Agents", MARGIN, 442)
    title(pdf, "Make agent optimization\nfalsifiable.", MARGIN, 398, 560, 48)
    text_block(
        pdf,
        "An open operation-control and evidence layer that binds what an agent was asked to do, what actually ran, what it cost, and whether a verifier outside the routed model accepted the result.",
        MARGIN,
        285,
        590,
        size=16,
        leading=23,
        color=MUTED,
    )

    card(pdf, 672, 248, 230, 162, BLUE, CARD_2)
    eyebrow(pdf, "Public-goods request", 696, 380, BLUE)
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 28)
    pdf.drawString(696, 339, "$150,000")
    text_block(pdf, "Nine months. Three go/no-go tranches. No equity. Open methods, code, evidence, and negative results.", 696, 308, 180, size=11.5, leading=16, color=MUTED)

    card(pdf, MARGIN, 95, 848, 104, GREEN)
    metric(pdf, 79, 158, 130, "808", "public GitHub stars", GREEN)
    metric(pdf, 270, 158, 150, "168", "signed prospective local cells", GREEN)
    metric(pdf, 485, 158, 140, "0", "adversarial false passes", GREEN)
    metric(pdf, 684, 158, 180, "OPEN", "MIT code + public proof", CYAN)
    source(pdf, "Prepared 2026-08-01. GitHub counts are a dated interest signal, not user or installation counts. Application not submitted.")


def slide_2(pdf: canvas.Canvas) -> None:
    background(pdf, 2, "The missing seam")
    eyebrow(pdf, "Problem", MARGIN, 442)
    title(pdf, "The model call is not the economic unit.", MARGIN, 404, 820, 35)
    text_block(pdf, "Real cost and failure accumulate across the entire operation.", MARGIN, 352, 760, 15, 20, MUTED)

    left_x = MARGIN
    y = 296
    y = bullet(pdf, "Decomposition, parallelism, retries, tools, context, recovery, and verification can overwhelm a cheap model choice.", left_x, y, 390)
    y = bullet(pdf, "A requested model can differ from the provider path that actually executes.", left_x, y - 10, 390, BLUE)
    y = bullet(pdf, "Unknown local, subscription, setup, or human cost is often collapsed into zero.", left_x, y - 10, 390, AMBER)
    bullet(pdf, "Model prose or stack status can be promoted to completion without an external artifact check.", left_x, y - 10, 390, RED)

    card(pdf, 500, 110, 402, 236, CYAN)
    stages = [
        ("01", "Declared plan", "Models, tools, topology, limits"),
        ("02", "Observed execution", "Calls, attempts, artifacts, cost lenses"),
        ("03", "External verdict", "Deterministic verifier outside the route"),
        ("04", "Signed evidence", "Offline-reconstructable receipt chain"),
    ]
    row_y = 305
    for number, heading, detail in stages:
        pdf.setFillColor(CYAN)
        pdf.setFont("Courier-Bold", 9)
        pdf.drawString(525, row_y, number)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(560, row_y, heading)
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica", 9.5)
        pdf.drawString(560, row_y - 16, detail)
        if number != "04":
            pdf.setStrokeColor(LINE)
            pdf.line(525, row_y - 31, 872, row_y - 31)
        row_y -= 53
    label(pdf, "Unknown stays unknown", 524, 83, AMBER)
    source(pdf, "Primary thesis: the unit worth optimizing is a model-externally verified operation, not an isolated model call.")


def slide_3(pdf: canvas.Canvas) -> None:
    background(pdf, 3, "What exists now")
    eyebrow(pdf, "Working substrate", MARGIN, 442)
    title(pdf, "Built before the grant.", MARGIN, 404, 400, 37)
    text_block(pdf, "Citadel is usable from a single command, then opens into stronger control only when the operation needs it.", MARGIN, 348, 390, 13.5, 19, MUTED)

    items = [
        ("/do", "Beginner path", "Natural-language work routing, verification, durable next action."),
        ("PLAN", "Portable contract", "Models, tools, topology, retries, privacy, time, cost, and stop rules."),
        ("RUN", "Runtime coverage", "Claude Code, Codex, Ollama, and a pinned Sentient ROMA binding."),
        ("PROOF", "Evidence plane", "External artifact verdicts, failure preservation, signed receipts, offline replay."),
    ]
    item_y = 292
    for code, heading, detail in items:
        pdf.setFillColor(CYAN if code in ("/do", "PROOF") else BLUE)
        pdf.setFont("Courier-Bold", 10)
        pdf.drawString(MARGIN, item_y, code)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(112, item_y, heading)
        text_block(pdf, detail, 112, item_y - 17, 322, 9.5, 13, MUTED)
        item_y -= 62

    card(pdf, 478, 92, 424, 320, BLUE, CARD_2)
    fit_image(pdf, ASSETS / "01-product-entry.png", 494, 108, 392, 288)
    source(pdf, "Public product: https://sethgammon.github.io/Citadel/  |  MIT repository: https://github.com/SethGammon/Citadel")


def slide_4(pdf: canvas.Canvas) -> None:
    background(pdf, 4, "Actual-run evidence")
    eyebrow(pdf, "Pinned Sentient ROMA diagnostic", MARGIN, 442)
    title(pdf, "The proof passed. The optimizer gate did not.", MARGIN, 404, 820, 34)
    text_block(pdf, "A frozen 24-cell run compared frontier, prompt-only routing, direct open/local 7B, and Citadel-controlled ROMA.", MARGIN, 356, 820, 13, 18, MUTED)

    headers = ["POLICY", "VERIFIED", "DURATION", "FRONTIER", "LOCAL / MODULE"]
    rows = [
        ["Frontier-only", "6 / 6", "47.7s", "6", "0"],
        ["Prompt router", "3 / 6", "40.8s", "3", "3"],
        ["Direct open/local 7B", "2 / 6", "13.2s", "0", "6"],
        ["Citadel + ROMA", "4 / 6", "1042.8s", "0", "89 module calls"],
    ]
    x_positions = [72, 355, 473, 587, 708]
    card(pdf, MARGIN, 156, 848, 172, CYAN)
    pdf.setFillColor(CYAN)
    pdf.setFont("Courier-Bold", 8)
    for x, head in zip(x_positions, headers):
        pdf.drawString(x, 301, head)
    row_y = 270
    for idx, row in enumerate(rows):
        if idx == 3:
            set_alpha(pdf, fill=0.14)
            pdf.setFillColor(CYAN)
            pdf.roundRect(68, row_y - 14, 814, 27, 5, fill=1, stroke=0)
            set_alpha(pdf, fill=1)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold" if idx == 3 else "Helvetica", 10.5)
        for x, value in zip(x_positions, row):
            pdf.drawString(x, row_y, value)
        row_y -= 31

    for x, accent in [(54, GREEN), (266, GREEN), (478, CYAN), (690, AMBER)]:
        card(pdf, x, 70, 190, 65, accent)
    metric(pdf, 72, 111, 155, "24 / 24", "measured cells", GREEN)
    metric(pdf, 284, 111, 155, "0", "false passes", GREEN)
    metric(pdf, 496, 111, 155, "4 / 6", "Citadel local verified", CYAN)
    metric(pdf, 708, 111, 155, "FAILED", "strong-attempt savings gate", AMBER)
    source(pdf, "Evidence: benchmarks/roma-operation-control/published-run/REPORT.md  |  Offline check: npm run operation-proof:verify")


def slide_5(pdf: canvas.Canvas) -> None:
    background(pdf, 5, "Claim discipline")
    eyebrow(pdf, "Negative evidence is a deliverable", MARGIN, 442, AMBER)
    title(pdf, "Citadel has already rejected its own easy story.", MARGIN, 404, 820, 33)

    card(pdf, MARGIN, 102, 490, 250, AMBER, CARD_2)
    fit_image(pdf, ASSETS / "03-policy-comparison.png", 70, 118, 458, 218)

    x = 580
    label(pdf, "V1 - timeout sensitivity", x, 336, CYAN)
    text_block(pdf, "27/36 vs 24/36 verified cells. The apparent 9.9% energy saving reversed after excluding one matched timeout pair: +3.5% energy and +5.4% modeled cost.", x, 306, 320, 10.5, 15, MUTED)

    label(pdf, "V2 - capability profile", x, 236, AMBER)
    text_block(pdf, "Equal 24/36 completion, but 12 escalations produced +15.7% measured GPU energy and +16.4% modeled cost.", x, 206, 320, 10.5, 15, MUTED)

    label(pdf, "V3 - repository artifacts", x, 151, VIOLET)
    text_block(pdf, "Both policies verified 6/12 cells. A 7.1% energy reduction missed the frozen 20% gate; tokens increased 13.2%.", x, 121, 320, 10.5, 15, MUTED)
    source(pdf, "All signed failures remain published under their original identities. Repetitions estimate timing variance, not independent task success.")


def slide_6(pdf: canvas.Canvas) -> None:
    background(pdf, 6, "Funded work")
    eyebrow(pdf, "Nine-month research and engineering program", MARGIN, 442)
    title(pdf, "Funding buys the unproven result.", MARGIN, 404, 760, 35)
    text_block(pdf, "The grant scales a working control and proof layer into a representative optimizer - or produces a reusable negative result.", MARGIN, 357, 820, 13, 18, MUTED)

    milestones = [
        ("01", "Representative workload", "60+ unique artifact-producing operations; complete cost boundary", "$30k", CYAN),
        ("02", "Adapter SDK", "Sentient ROMA plus two additional open stacks", "$28k", BLUE),
        ("03", "Expected-value controller", "Price verification, escalation, recovery, and failure", "$35k", VIOLET),
        ("04", "Prospective evaluation", "Frozen multi-stack policy and statistical contract", "$32k", AMBER),
        ("05", "Public proof + release", "Hosted reconstruction, /do docs, cohort, maintenance", "$25k", GREEN),
    ]
    box_w = 160
    gap = 12
    x = MARGIN
    for number, heading, detail, amount, color in milestones:
        card(pdf, x, 120, box_w, 198, color)
        pdf.setFillColor(color)
        pdf.setFont("Courier-Bold", 9)
        pdf.drawString(x + 17, 290, number)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 12)
        heading_y = text_block(pdf, heading, x + 17, 263, box_w - 32, 12, 15, INK, "Helvetica-Bold")
        text_block(pdf, detail, x + 17, heading_y - 8, box_w - 32, 9.5, 13.5, MUTED)
        pdf.setFillColor(color)
        pdf.setFont("Courier-Bold", 14)
        pdf.drawString(x + 17, 140, amount)
        x += box_w + gap

    source(pdf, "Canonical milestones and acceptance gates: docs/grants/MILESTONES_AND_BUDGET.md")


def slide_7(pdf: canvas.Canvas) -> None:
    background(pdf, 7, "Budget and gates")
    eyebrow(pdf, "No-go rules are part of the product", MARGIN, 442, GREEN)
    title(pdf, "Clear spend. Hard outcome gates.", MARGIN, 404, 800, 35)

    card(pdf, MARGIN, 105, 414, 252, CYAN)
    eyebrow(pdf, "Cost basis", 78, 329)
    budget = [
        ("Maintainer labor", "$99,000"),
        ("Compute and tools", "$27,000"),
        ("Hosted reproducibility", "$7,000"),
        ("Docs and accessibility", "$7,000"),
        ("Operator cohort", "$2,000"),
        ("Bounded contingency", "$8,000"),
    ]
    row_y = 299
    for name, amount in budget:
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica", 10.5)
        pdf.drawString(78, row_y, name)
        pdf.setFillColor(INK)
        pdf.setFont("Courier-Bold", 10.5)
        pdf.drawRightString(438, row_y, amount)
        row_y -= 27
    pdf.setStrokeColor(LINE)
    pdf.line(78, 127, 438, 127)
    pdf.setFillColor(GREEN)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(78, 110, "Total")
    pdf.setFont("Courier-Bold", 15)
    pdf.drawRightString(438, 110, "$150,000")

    card(pdf, 500, 105, 402, 252, GREEN, CARD_2)
    eyebrow(pdf, "Primary prospective gate", 526, 329, GREEN)
    metric(pdf, 526, 285, 145, ">= 80%", "absolute verified completion", GREEN)
    metric(pdf, 720, 285, 145, ">= 95%", "of valid frontier rate", GREEN)
    metric(pdf, 526, 205, 145, ">= 30%", "lower measured end-to-end cost", GREEN)
    metric(pdf, 720, 205, 145, "ZERO", "false passes and integrity failures", GREEN)
    label(pdf, "Unknown cost cannot count as savings", 526, 127, AMBER)

    source(pdf, "Tranches: $45k / $60k / $45k. Failed gates terminate in public evidence, failure analysis, reusable artifacts, and unused-funds accounting.")


def slide_8(pdf: canvas.Canvas) -> None:
    background(pdf, 8, "Why Sentient")
    eyebrow(pdf, "Direct fit with a named request for products", MARGIN, 442)
    title(pdf, "An open optimizer that can prove when it is wrong.", MARGIN, 404, 820, 34)

    card(pdf, MARGIN, 175, 410, 165, CYAN)
    eyebrow(pdf, "Why fund Citadel", 79, 313)
    bullet(pdf, "Directly targets Sentient's Token and Economic Optimization request.", 76, 278, 355, CYAN, 10.5)
    bullet(pdf, "Already binds a pinned Sentient ROMA stack without replacing its planner.", 76, 238, 355, BLUE, 10.5)
    bullet(pdf, "Existing signed evidence lowers substrate risk and exposes the exact remaining research risk.", 76, 198, 355, GREEN, 10.5)

    card(pdf, 492, 175, 410, 165, VIOLET, CARD_2)
    eyebrow(pdf, "What stays public", 517, 313, VIOLET)
    bullet(pdf, "MIT code, adapters, conformance contracts, methods, verifiers, cells, and reports.", 514, 278, 355, VIOLET, 10.5)
    bullet(pdf, "No mandatory Citadel account, token, hosted evidence endpoint, or telemetry resale.", 514, 238, 355, CYAN, 10.5)
    bullet(pdf, "Users keep project state, operations, receipts, and the right to run locally.", 514, 198, 355, GREEN, 10.5)

    card(pdf, MARGIN, 84, 848, 78, GREEN)
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 15)
    pdf.drawString(78, 132, "Seth Gammon - solo builder and maintainer")
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 10.5)
    pdf.drawString(78, 109, "Evaluator path: github.com/SethGammon/Citadel/blob/main/docs/grants/EVALUATOR_START_HERE.md")
    pdf.setFillColor(CYAN)
    pdf.setFont("Courier-Bold", 10)
    pdf.drawRightString(875, 131, "OPEN. VERIFIABLE. FALSIFIABLE.")
    source(pdf, "Program: https://sentient.foundation/grants  |  Request: https://sentient.foundation/product-requests  |  Application packet not submitted.")


def render() -> Path:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(OUTPUT), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    pdf.setTitle("Citadel - Sentient Open Source AGI Grant Support Packet")
    pdf.setAuthor("Seth Gammon")
    pdf.setSubject("Verifiable token and economic optimization for open agent stacks")

    slides = [slide_1, slide_2, slide_3, slide_4, slide_5, slide_6, slide_7, slide_8]
    for index, slide in enumerate(slides):
        slide(pdf)
        if index < len(slides) - 1:
            pdf.showPage()
    pdf.save()
    return OUTPUT


if __name__ == "__main__":
    print(render())
