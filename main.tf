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

# Used to inject a Basis Theory Node JS instance in the Transform "req.bt"
resource "basistheory_application" "proxy_application" {
  name        = "Proxy Application"
  type        = "private"
  rule {
    description = "Create PCI Tokens"
    priority    = 1
    container   = "/pci/high/"
    transform   = "mask"
    permissions = [
      "token:create",
    ]
  }
}

resource "basistheory_proxy" "inbound_proxy" {
  name               = "Inbound Proxy"
  destination_url    = "https://echo.basistheory.com/anything" // replace this with destination API endpoint
  application_id     = basistheory_application.proxy_application.id
  response_transform = {
    code = file("./recognize.js")
  }
}

resource "basistheory_application" "client_application" {
  name        = "Client Application"
  type        = "private"
  permissions = [
    "token:use"
  ]
}

output "inbound_proxy_key" {
  value       = basistheory_proxy.inbound_proxy.key
  description = "Inbound Proxy Key used to identify the Proxy instance"
  sensitive   = true
}

output "client_api_key" {
  value       = basistheory_application.client_application.key
  description = "Client API Key used to invoke the Proxy"
  sensitive   = true
}

