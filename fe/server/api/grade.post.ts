import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // get it from environment

});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const prompt = `
    You are an autograder. Grade the following student assignment.

    Course: ${body.courseName}
    Assignment: ${body.assignmentDescription}
    Rubric: ${body.rubric || "No rubric provided"}
    Answer key: ${body.asnwerkey || "No Answer key Provided"}
    Student Submission: ${body.studentSubmission}
    Relevant Course Materials: ${body.courseMaterials || "None"}

    Return ONLY valid JSON in this format:
    {
      "estimatedGrade": number,
      "feedback": "string",
      "improvementSuggestions": ["string", "string"]
    }
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2, // lower randomness → more structured
    });

    const content = response.choices[0].message?.content || "{}";
    console.log("📝 OpenAI raw output:", content);

    let result;
    try {
      result = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      result = { error: "Invalid JSON", raw: content };
    }

    return result;
  } catch (err) {
    console.error("OpenAI API error:", err);
    throw createError({ statusCode: 500, statusMessage: "OpenAI request failed" });
  }
});
