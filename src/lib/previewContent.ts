export function getPreviewExample({ grade, subject, language }: { grade?: any; subject?: string; language?: string } = {}) {
  const s = String(subject || '').toLowerCase()
  const kind = /math/.test(s) ? 'math' : /sci|evs|physics|chem|bio|environment/.test(s) ? 'science' : /english|language|read|litera/.test(s) ? 'reading' : 'general'
  const band = grade == null || Number(grade) <= 2 ? 'early' : 'older'
  const content: any = {
    math: {
      early: { simplified: ['Numbers count things.', 'You have 2 hands. Each hand has 5 fingers.', '2 + 3 means: 2 things, then 3 more things.', 'Put them together. Now you have 5 things!'], audioText: 'Let us count together. Two and three make five.', visual: 'apples', quiz: { question: 'How many is 2 + 3?', options: ['4', '5', '6'], answerIndex: 1, hint: 'Count: 1, 2, then 3 more.' } },
      older: { simplified: ['A fraction is a fair share.', 'Cut a cake into 4 equal pieces.', 'Take 3 pieces. That is 3/4.'], audioText: 'A fraction is a fair share. Three pieces out of four is three quarters.', visual: 'fraction', quiz: { question: '3 of 4 parts coloured. Fraction?', options: ['1/4', '3/4', '4/3'], answerIndex: 1, hint: 'Coloured on top, all on bottom.' } },
    },
    science: {
      early: { simplified: ['Water travels in a big circle.', 'The sun warms water.', 'Water goes up and makes clouds.', 'Rain falls and the circle starts again.'], audioText: 'Water goes around and around. The sun warms it. Clouds form. Rain falls.', visual: 'water', quiz: { question: 'What falls from a cloud?', options: ['Rain', 'Rocks', 'Stars'], answerIndex: 0, hint: 'Think rainy day.' } },
      older: { simplified: ['Plants make their own food.', 'Leaves take in sunlight and air.', 'Roots take in water.', 'This is called photosynthesis.'], audioText: 'Plants make food. Leaves catch sunlight. Roots drink water. This is photosynthesis.', visual: 'plant', quiz: { question: 'What do plants need to make food?', options: ['Only water', 'Sunlight, air and water', 'Only soil'], answerIndex: 1, hint: 'Leaf and roots.' } },
    },
    reading: {
      early: { simplified: ['The cat sat on the mat.', 'The dog sat by the log.', 'The cat said, come here dog!', 'So the dog sat on the mat too.'], audioText: 'The cat sat on the mat. The dog sat by the log.', visual: 'cat', quiz: { question: 'Who sat on the mat first?', options: ['The dog', 'The cat', 'The log'], answerIndex: 1, hint: 'First line.' } },
      older: { simplified: ['A story has a beginning, middle, and end.', 'Beginning introduces who and where.', 'Middle has a problem.', 'End shows how solved.'], audioText: 'Every story has three parts. Beginning, middle, end.', visual: 'story', quiz: { question: 'Which part has the problem?', options: ['Beginning', 'Middle', 'End'], answerIndex: 1, hint: 'Middle.' } },
    },
    general: {
      early: { simplified: ['A tiny seed can grow into a big plant.', 'The seed goes under soil.', 'It needs water and sunlight.', 'First root grows down, then shoot grows up.'], audioText: 'A tiny seed can grow into a big plant.', visual: 'plant', quiz: { question: 'What does a seed need to grow?', options: ['Water and sunlight', 'Only toys', 'Nothing'], answerIndex: 0, hint: 'Watering plants.' } },
      older: { simplified: ['Learning works better in small steps.', 'Read a little. Then try it yourself.', 'Short practice helps memory.', 'Come back tomorrow to make it stick.'], audioText: 'Read a little, then try it yourself.', visual: 'plant', quiz: { question: 'Good way to remember?', options: ['Read everything once fast', 'Short practice then try', 'Never practice'], answerIndex: 1, hint: 'Little and often.' } },
    },
  }
  const ex = content[kind][band] || content[kind].older
  return { ...ex, subjectKind: kind, band, language, speechLang: language && language !== 'en' ? language : 'en', languageNote: language && language !== 'en' ? 'This example is in English. When a lesson is available in your language, it will be read in that language.' : null }
}
