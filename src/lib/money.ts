export function furnishedTotal(basePaise: bigint, packagePaise: bigint): bigint {
  if (basePaise < 0n || packagePaise < 0n) throw new Error('Negative prices are invalid');
  return basePaise + packagePaise;
}

export function formatINR(paise: bigint): string {
  const rupees = paise / 100n;
  if (rupees >= 10000000n) {
    const lakhHundredths = (rupees * 100n + 500000n) / 10000000n;
    return `₹${lakhHundredths / 100n}.${String(lakhHundredths % 100n).padStart(2, '0')} Cr`;
  }
  if (rupees >= 100000n) {
    const lakhHundredths = (rupees * 100n + 5000n) / 100000n;
    return `₹${lakhHundredths / 100n}.${String(lakhHundredths % 100n).padStart(2, '0')} L`;
  }
  return `₹${rupees.toLocaleString('en-IN')}`;
}
