# OCR Example

This example repository shows how to perform [Optical Character Recognition (OCR)](https://en.wikipedia.org/wiki/Optical_character_recognition) in virtual credit card image using [Tesseract.js](https://tesseract.projectnaptha.com).

In this setup, a client makes an API request to a server that returns the virtual credit card image encoded in [Base64](https://datatracker.ietf.org/doc/html/rfc3548#page-4). Since the Cardholder Data contained in the image is considered sensitive and regulated by PCI DSS, the request is made securely through a Basis Theory Proxy, which will transform the encoded image into a [card token](https://developers.basistheory.com/docs/api/tokens/#card-object) through a response transform custom code ([recognize.js](./recognize.js)).

To represent the server URL, we will use `https://echo.basistheory.com/anything`, to echo back whatever was passed in the request.

## Provision Resources with Terraform

[Create a new Management Application](https://portal.basistheory.com/applications/create?name=Terraform&permissions=application%3Acreate&permissions=application%3Aread&permissions=application%3Aupdate&permissions=application%3Adelete&permissions=proxy%3Acreate&permissions=proxy%3Aread&permissions=proxy%3Aupdate&permissions=proxy%3Adelete&type=management) with full `application` and `proxy` permissions.

Paste the API key to a new `terraform.tfvars` file at this repository root:

```terraform
management_api_key = "key_W8wA8CmcbwXxJsomxeWHVy"
```

Initialize Terraform:

```shell
terraform init
```

And run Terraform to provision all the required resources:

```shell
terraform apply
```

## Invoke the Proxy

Using the `inbound_proxy_key` and `client_api_key` generated as a Terraform state outputs, make the following request passing the Base64 encoded version of the [example image](card.png) in the payload:

```shell
curl --location --request POST 'https://api.basistheory.com/proxy?bt-proxy-key={{inbound_proxy_key}}' \
--header 'BT-API-KEY: {{client_api_key}}' \
--header 'Content-Type: application/json' \
--data-raw '{
"image": "'"$(base64 -i card.png)"'"
}'
```

> Make sure to replace the variables above with the Terraform outputs stored in Terraform state.

You should receive a [Create Token Response](https://developers.basistheory.com/docs/api/tokens/#create-token) in a `token` body attribute. 

## Tests

The `recognize.test.js` shows how the response transform code can be tested. To run it, install dependencies with:

```shell
yarn install
```

And run the command:

```
yarn test
```