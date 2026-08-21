const COURSES = ['msword', 'mspowerpoint', 'msexcel', 'internet', 'sysarch'];

function computeAverage(scores) {
  const vals = COURSES
    .map((k) => scores[k])
    .filter((v) => v !== null && v !== undefined);
  if (vals.length === 0) return null;
  const sum = vals.reduce((a, b) => a + Number(b), 0);
  return Math.round((sum / vals.length) * 10) / 10;
}

function remarkFor(avg) {
  if (avg === null) {
    return { label: 'Not graded yet', encouragement: "Your scores will appear here once you're graded." };
  }
  if (avg >= 75) {
    return { label: 'Distinction', encouragement: "Outstanding work — you've mastered this to a high standard. Keep pushing yourself!" };
  }
  if (avg >= 60) {
    return { label: 'Credit', encouragement: 'Well done — a strong, solid result. A little more practice and distinction is within reach.' };
  }
  if (avg >= 50) {
    return { label: 'Pass', encouragement: "You've passed — a good foundation. Put in a bit more practice to strengthen your skills further." };
  }
  return { label: 'Fail', encouragement: "Don't be discouraged — everyone learns at their own pace. Speak with your instructor and keep practicing; you can turn this around." };
}

module.exports = { COURSES, computeAverage, remarkFor };
