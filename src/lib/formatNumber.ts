export const formatNumber = (number: number, maxDigit: number) => {
  return Number(number).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDigit,
  });
};
