import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { articleWordCount, readingTime } from "../src/lib/reading-time.js";

const post = {
  body: "one two three four",
  data: {
    title: "Title words",
    description: "Description words here",
  },
};

assert.equal(articleWordCount(post), 9);

const qLearningPost = {
  body: readFileSync(
    "src/content/blog/2019-01-20-qlearning-openaitaxi.md",
    "utf8",
  ),
  data: {
    title: "Reinforcement Learning: Q-Learning with Open AI Taxi",
    description:
      "Python code in a Jupyter notebook to implement Q-learning using the Open AI Taxi environment",
  },
};

assert.ok(articleWordCount(qLearningPost) > 1000);
assert.equal(readingTime(0), 1);
assert.equal(readingTime(180), 1);
assert.equal(readingTime(181), 2);

console.log("Reading time verification passed");
