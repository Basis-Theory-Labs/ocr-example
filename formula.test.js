const Chance = require("chance");
const tesseract = require("tesseract.js");

const chance = new Chance();
const url =
  "https://raw.githubusercontent.com/Basis-Theory-Labs/ocr-example/1e5050422dd081dcddc315d68b0e14a21f97c6e8/assets/card.png";
const createWorker = jest.spyOn(tesseract, "createWorker");

describe("recognize", function () {
  let bt;
  let formula;

  beforeEach(() => {
    formula = require("./formula");
    bt = {
      tokens: {
        create: jest.fn(),
      },
    };
  });

  test("returns internal errors in the response body", async () => {
    const message = `${chance.animal()} is not a toy.`;

    createWorker.mockImplementationOnce(() => {
      throw new TypeError(message);
    });

    const {
      raw: { error },
    } = await formula({ bt, args: {} });

    expect(error).toEqual(
      expect.objectContaining({
        message,
      })
    );
  });

  test("tokenizes card per URL", async () => {
    const token = chance.string();
    bt.tokens.create.mockResolvedValueOnce(token);

    const { raw } = await formula({
      bt,
      args: {
        url,
      },
    });

    expect(bt.tokens.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "card",
        data: {
          number: "4242424242424242",
          expiration_month: "04",
          expiration_year: "2024",
          cvc: "242",
        },
      })
    );

    expect(raw.token).toStrictEqual(token);
  });
});
