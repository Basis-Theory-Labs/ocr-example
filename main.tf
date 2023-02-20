terraform {
  required_providers {
    basistheory = {
      source  = "basis-theory/basistheory"
      version = ">= 0.7.0"
    }
  }
}

variable "management_api_key" {}

provider "basistheory" {
  api_key = var.management_api_key
}

resource "basistheory_application" "reactor_application" {
  name = "Reactor Application"
  type = "private"
  rule {
    description = "Create PCI Tokens"
    priority    = 1
    container   = "/pci/high/"
    transform   = "mask"
    permissions = [
      "token:create",
      "token:use"
    ]
  }
}


resource "basistheory_reactor_formula" "ocr_reactor_formula" {
  name              = "Card OCR Reactor Formula"
  description       = "Recognizes cardholder data from image and tokenizes it"
  type              = "private"
  icon              = format("%s%s", "data:image/png;base64,", filebase64("assets/icon.png"))
  code              = file("./recognize.js")
  request_parameter {
    name        = "url"
    description = "Image URL to perform OCR on."
    type        = "string"
  }
}

resource "basistheory_reactor" "ocr_reactor" {
  name       = "Card OCR Reactor"
  formula_id = basistheory_reactor_formula.ocr_reactor_formula.id
  application_id = basistheory_application.reactor_application.id
}

output "reactor_id" {
  value       = basistheory_reactor.ocr_reactor.id
  description = "Reactor ID"
}

output "reactor_api_key" {
  value       = basistheory_application.reactor_application.key
  description = "Client API Key used to invoke the Reactor"
  sensitive   = true
}

