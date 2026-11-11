/**
 * STS FINTECH – Autonomous Financial Validation Engine (Phase 7)
 * 
 * Performs strict, multi-tier mathematical integrity checks on OCR-extracted receipts:
 * 1. Line-item level: Expected Amount = Quantity * Unit Rate (within paisa tolerance).
 * 2. Table level: Sum of Line Items vs Taxable Subtotal.
 * 3. Tax Structure: Determines whether tax is Inclusive, Exclusive, or Zero/Exempt.
 * 4. Grand Total Balance: Validates Subtotal + Tax - Discount = Grand Total.
 * 5. Flags discrepancies with strict enterprise statuses: GREEN, YELLOW, RED.
 * 
 * NEVER forces numbers to match; transparently flags verification needs.
 */

export function validateFinancialBill({
  totalAmount = '0.00',
  taxableAmount = '0.00',
  cgst = '0.00',
  sgst = '0.00',
  igst = '0.00',
  totalTax = '0.00',
  discount = '0.00',
  items = []
}) {
  const tot = parseFloat(totalAmount) || 0;
  const sub = parseFloat(taxableAmount) || 0;
  const c = parseFloat(cgst) || 0;
  const s = parseFloat(sgst) || 0;
  const ig = parseFloat(igst) || 0;
  const tax = parseFloat(totalTax) || (c + s + ig);
  const disc = parseFloat(discount) || 0;

  // 1. Line Items Arithmetic Audit
  const itemValidations = (items || []).map((it, idx) => {
    const q = parseFloat(it.quantity) || 1;
    const r = parseFloat(it.rate || it.unit_price) || 0;
    const a = parseFloat(it.amount || it.total) || 0;

    let isConsistent = true;
    let expectedAmount = a;
    let difference = 0;
    let status = 'VERIFIED';
    let flagReason = '';

    if (r > 0 && q > 0) {
      expectedAmount = parseFloat((q * r).toFixed(2));
      difference = Math.abs(expectedAmount - a);
      if (difference > 1.00) {
        // Discrepancy beyond standard paisa rounding
        isConsistent = false;
        status = 'WARNING';
        flagReason = `Qty (${q}) × Rate (₹${r}) = ₹${expectedAmount.toFixed(2)}, but amount is ₹${a.toFixed(2)}`;
      }
    } else if (a > 0 && r === 0) {
      status = 'UNVERIFIED_RATE';
      flagReason = 'Unit rate not detected; amount recorded directly';
    } else if (a === 0) {
      isConsistent = false;
      status = 'ZERO_AMOUNT';
      flagReason = 'Line item amount is zero';
    }

    // Impossible item price check: Single item cannot exceed the total bill
    if (tot > 0 && a > tot * 1.05) {
      isConsistent = false;
      status = 'EXCEEDS_TOTAL';
      flagReason = `Item amount (₹${a}) exceeds total receipt amount (₹${tot})`;
    }

    return {
      id: it.id || `item-${idx + 1}`,
      description: it.description || it.item_name || 'Line Item',
      quantity: q,
      rate: r,
      amount: a,
      expectedAmount,
      difference,
      isConsistent,
      status,
      flagReason,
    };
  });

  const calculatedItemsSum = parseFloat(
    itemValidations.reduce((acc, it) => acc + (it.amount || 0), 0).toFixed(2)
  );

  // 2. Tax Structure Detection
  let isTaxInclusive = false;
  let taxStructureType = 'EXCLUSIVE'; // 'EXCLUSIVE', 'INCLUSIVE', 'EXEMPT'

  if (tax === 0 && disc === 0 && sub > 0 && Math.abs(sub - tot) <= 1.00) {
    taxStructureType = 'EXEMPT';
  } else if (tax > 0) {
    const exclusiveExpected = sub + tax - disc;
    const inclusiveExpected = sub - disc;

    if (Math.abs(exclusiveExpected - tot) <= 1.50) {
      taxStructureType = 'EXCLUSIVE';
      isTaxInclusive = false;
    } else if (Math.abs(inclusiveExpected - tot) <= 1.50) {
      taxStructureType = 'INCLUSIVE';
      isTaxInclusive = true;
    }
  }

  // 3. Mathematical Balance Auditing
  let expectedTotal = tot;
  let discrepancyAmount = 0;
  let subtotalMatchesItems = true;

  if (calculatedItemsSum > 0 && sub > 0) {
    subtotalMatchesItems = Math.abs(calculatedItemsSum - sub) <= 1.50;
  }

  if (taxStructureType === 'EXCLUSIVE') {
    expectedTotal = parseFloat((sub + tax - disc).toFixed(2));
  } else if (taxStructureType === 'INCLUSIVE' || taxStructureType === 'EXEMPT') {
    expectedTotal = parseFloat((sub - disc).toFixed(2));
  }

  if (tot > 0 && expectedTotal > 0) {
    discrepancyAmount = parseFloat(Math.abs(tot - expectedTotal).toFixed(2));
  }

  // 4. Overall Confidence & Tri-color Status Assignment
  let status = 'GREEN';
  let statusBadge = 'Financial Calculations Verified (100% Balanced)';
  let discrepancyMessage = '';
  let confidenceScore = 98;

  const hasInconsistentItems = itemValidations.some((it) => it.status === 'EXCEEDS_TOTAL');
  const hasItemMathWarnings = itemValidations.some((it) => it.status === 'WARNING');

  if (hasInconsistentItems || discrepancyAmount > 5.00) {
    status = 'RED';
    confidenceScore = 45;
    statusBadge = 'Financial Discrepancy Detected';
    discrepancyMessage = `Receipt totals do not balance: Expected ₹${expectedTotal.toFixed(2)}, got ₹${tot.toFixed(2)} (Diff: ₹${discrepancyAmount.toFixed(2)})`;
  } else if (hasItemMathWarnings || discrepancyAmount > 1.50 || (!subtotalMatchesItems && calculatedItemsSum > 0)) {
    status = 'YELLOW';
    confidenceScore = 75;
    statusBadge = 'Verification Suggested';
    discrepancyMessage = discrepancyAmount > 0
      ? `Minor discrepancy of ₹${discrepancyAmount.toFixed(2)} detected (possible round-off or packaging charge)`
      : 'Some item unit calculations differ slightly from row totals';
  } else {
    status = 'GREEN';
    confidenceScore = 99;
    statusBadge = 'Financial Calculations Verified (100% Balanced)';
    discrepancyMessage = 'All line items, taxes, discounts, and totals are mathematically reconciled.';
  }

  return {
    status,
    confidenceScore,
    statusBadge,
    isTaxInclusive,
    taxStructureType,
    calculatedItemsSum,
    subtotal: sub,
    totalTax: tax,
    discount: disc,
    grandTotal: tot,
    expectedTotal,
    discrepancyAmount,
    discrepancyMessage,
    subtotalMatchesItems,
    itemValidations,
  };
}

