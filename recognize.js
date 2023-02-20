const { createWorker } = require("tesseract.js");
// const { serializeError } = require("serialize-error");

module.exports = async function (req) {
  const {
    bt,
    args: { url },
  } = req;
  let worker;

  try {
    worker = await createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: { text },
    } = await worker.recognize(url);

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
    });

    return {
      raw: {
        token,
      },
    };
  } catch (error) {
    return {
      raw: {
        // error: serializeError(error),
        error,
      },
    };
  } finally {
    await worker?.terminate();
  }
};
