# External Adapters

This directory contains adapters for external services:

- `razorpay/` - Payment gateway adapter
- `maps/` - Google Maps adapter
- `vahan/` - Vahan API adapter
- `irp/` - eInvoice IRP adapter
- `sip/` - SIP/calling adapter

All adapters support mock mode via `ADAPTER_MODE` environment variable:
- `ADAPTER_MODE=mock` - Use local mocks
- `ADAPTER_MODE=prod` - Use production APIs

