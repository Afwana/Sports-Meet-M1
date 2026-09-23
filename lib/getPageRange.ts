export function getPageRange(current: number, total: number, siblingCount = 1) {
  const totalVisible = siblingCount * 2 + 5; // first + last + current + 2 siblings + 2 dots

  if (total <= totalVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  const range: (number | "dots-left" | "dots-right")[] = [1];

  if (showLeftDots) range.push("dots-left");

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== total) range.push(i);
  }

  if (showRightDots) range.push("dots-right");

  range.push(total);

  return range;
}
