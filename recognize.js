const { createWorker } = require("tesseract.js");

module.exports = async function (req) {
  const {
    bt,
    args: { headers, body },
  } = req;

  let worker;

  try {
    const {
      json: {image},
    } = body; // get image base64 from echo response

    worker = await createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: {text},
    } = await worker.recognize(Buffer.from(image, "base64"));

    const cardData = [...text.matchAll(/\d+/g)]
        .map((match) => match[0])
        .reverse();

    const [cvc, expiration_year, expiration_month, ...numberArr] = cardData;
    const number = numberArr.join("");

    const token = await bt.tokens.create({
      type: "card",
      data: {
        number,
        expiration_month,
        expiration_year: `20${expiration_year}`,
        cvc,
      },
      // deduplicateToken: true, // uncomment this if you want to deduplicate the token based on card number
    });

    return {
      headers,
      body: {
        token
      },
    };
  } catch (error) {
    return {
      headers,
      body: {
        error: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
      }
    }
  } finally {
    await worker?.terminate();
  }
};
