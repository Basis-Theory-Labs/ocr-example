const Chance = require("chance");
const fs = require("fs");
const recognize = require("./recognize");

const chance = new Chance();

describe("recognize", function () {
  let bt;
  let card;
  let headers;

  beforeAll(() => {
    card = fs.readFileSync("./card.png", { encoding: "base64" });
  });

  beforeEach(() => {
    bt = {
      tokens: {
        create: jest.fn(),
      },
    };
    headers = {};
  });

  test("returns internal errors in the response body", async () => {
    const { body: { error }} = await recognize({ bt, args: {}});

    expect(error).toEqual(expect.objectContaining({
      message: expect.any(String),
      stack: expect.any(String)
    }))
  })

  test("tokenizes card per base64 image", async () => {
    const token = chance.string();
    bt.tokens.create.mockResolvedValueOnce(token);

    const { body } = await recognize({
      bt,
      args: {
        headers,
        body: {
          json: {
            image: card,
          },
        },
      },
    });

    expect(bt.tokens.create).toHaveBeenCalledWith(expect.objectContaining({
      type: "card",
      data: {
        number: "4242424242424242",
        expiration_month: "04",
        expiration_year: "2024",
        cvc: "242",
      },
    }));

    expect(body.token).toStrictEqual(token);
  });
});
