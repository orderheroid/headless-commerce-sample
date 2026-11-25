// Messages for the buyer, matched by `error` code (the codes are stable; the API `message` may change).

const MESSAGES: Record<string, string> = {
  // Store configuration: the buyer cannot fix this themselves
  CONFIG_MISSING: 'The store is not ready to take orders yet. Please contact the seller.',
  UNAUTHORIZED: 'The store is currently unavailable. Please contact the seller.',
  SECRET_KEY_FROM_BROWSER: 'The store is currently unavailable. Please contact the seller.',
  SCOPE_NOT_ALLOWED: 'The store is currently unavailable. Please contact the seller.',
  KEY_CREATOR_REVOKED: 'The store is currently unavailable. Please contact the seller.',
  FEATURE_NOT_AVAILABLE: 'The store is currently unavailable. Please contact the seller.',
  QUOTA_EXCEEDED: 'The store cannot take new orders right now. Please contact the seller.',

  // Temporary
  RATE_LIMITED: 'The store is busy right now. Please wait a moment and try again.',
  RATE_LIMITER_UNAVAILABLE: 'The service is busy. Try again in a moment.',
  UPSTREAM_UNAVAILABLE: 'The service is having trouble. Try again in a moment.',
  INTERNAL_ERROR: 'Something went wrong on the server. Try again in a moment.',
  NETWORK_ERROR: 'The connection to the server was lost. Check your internet and try again.',
  IDEMPOTENCY_IN_PROGRESS: 'Your order is still being processed. Wait a few seconds, then press the button again.',
  IDEMPOTENCY_OUTCOME_UNKNOWN:
    'We could not confirm your previous order yet. Wait a moment and try again; your order will not be duplicated.',
  IDEMPOTENCY_KEY_REUSED: 'Your order details changed. Press the button once more to continue.',

  // Cart
  ITEMS_REQUIRED: 'Your cart is empty.',
  TOO_MANY_ITEMS: 'Too many products in one order (maximum 50).',
  PRODUCT_NOT_FOUND: 'A product in your cart is no longer available. Remove it and try again.',
  PRODUCT_INACTIVE: 'A product in your cart is not for sale right now. Remove it and try again.',
  VARIANT_NOT_FOUND: 'The selected variant is no longer available. Choose again from the product page.',
  VARIANT_REQUIRED: 'This product has variants. Choose one from the product page first.',
  INVALID_QUANTITY: 'Quantity must be between 1 and 100.',
  PRICE_UNAVAILABLE: 'The price for this product is not available yet. Please contact the seller.',
  PWYW_NOT_SUPPORTED: 'There is a pay-what-you-want product in your cart. Remove it from the cart, then buy it using the button on its product page.',
  OUT_OF_STOCK: 'Not enough stock. Reduce the quantity and try again.',
  LICENSE_KEYS_UNAVAILABLE: 'This product is out of stock right now. Try again later.',
  DIGITAL_CONTENT_TYPE_REQUIRED: 'This product is not ready for sale yet. Please contact the seller.',
  DIGITAL_CONTENT_REQUIRED: 'This product is not ready for sale yet. Please contact the seller.',
  SHIPPING_ADDRESS_REQUIRED: 'This store only sells digital products. Remove physical products from your cart.',

  // Coupon
  COUPON_INVALID: 'This coupon code is not valid for this order.',
  COUPON_LIMIT_REACHED: 'The coupon has just run out. The total was recalculated without the coupon.',

  // Buyer
  CUSTOMER_NAME_REQUIRED: 'Name is required.',
  CUSTOMER_CONTACT_REQUIRED: 'Email and WhatsApp number are required.',
  INVALID_EMAIL: 'The email format is not valid.',
  INVALID_INPUT: 'A field contains characters that are not allowed. Please check what you entered.',

  // Payment
  PAYMENT_METHOD_REQUIRED: 'Choose a payment method first.',
  PAYMENT_METHOD_UNAVAILABLE: 'That payment method is not available right now. Choose another method.',
  CHANNEL_NOT_SUPPORTED: 'That payment method is not available right now. Choose another method.',
  CHANNEL_UNDER_MAINTENANCE: 'That payment method is under maintenance. Choose another method.',
  GATEWAY_NOT_CONFIGURED: 'That payment method is not available right now. Choose another method.',
  DOKU_CHECKOUT_DISABLED: 'That payment method is not available right now. Choose another method.',
  AMOUNT_BELOW_MINIMUM: 'The order total is below the minimum for this payment method. Choose another method.',
  PAYMENT_CREATE_FAILED: 'The payment code could not be created. Try again or choose another method.',
  MAX_PAYMENT_ATTEMPTS: 'The payment code has been regenerated too many times today. Use the latest code or try again tomorrow.',
  ALREADY_PAID: 'This order is already paid. You do not need to pay again.',
  ORDER_CANCELLED: 'This order has been cancelled. Please place a new order.',
  ORDER_CLOSED: 'The deadline for this order has passed. Please place a new order.',

  // Order
  // Manual transfer confirmation
  NOT_MANUAL_TRANSFER: 'This order is not paid by manual transfer; its status updates automatically.',
  SENDER_NAME_REQUIRED: 'Enter the name of the sending account holder.',
  PROOF_FILE_INVALID: 'Proof of transfer must be a JPG, PNG, WebP, or PDF file.',
  PROOF_FILE_TOO_LARGE: 'The proof of transfer file is too large (maximum 4 MB).',
  PAYLOAD_TOO_LARGE: 'The proof of transfer file is too large (maximum 4 MB).',
  PROOF_UPLOAD_FAILED: 'The proof could not be uploaded and the confirmation was not recorded. Try sending it again.',
  CONFIRMATION_PENDING: 'We have received your confirmation and it is awaiting verification.',
  CONFIRMATION_ALREADY_VERIFIED: 'Payment for this order has already been verified.',

  ORDER_NOT_FOUND: 'Order not found.',
  NOT_FOUND: 'Data not found.',
  INVALID_REFERENCE: 'The order link is not valid.',
  INVALID_RETURN_URL: 'The store is not ready to take orders yet. Please contact the seller.',
  INVALID_STATUS_URL: 'The store is not ready to take orders yet. Please contact the seller.',
  INVALID_EXPIRES_IN: 'The store is not ready to take orders yet. Please contact the seller.',
}

const FALLBACK = 'Something went wrong. Try again in a moment.'

export function buyerMessage(code: string, extra?: Record<string, unknown>): string {
  if (code === 'OUT_OF_STOCK' && typeof extra?.available === 'number') {
    return extra.available > 0
      ? `Not enough stock, only ${extra.available} left. Reduce the quantity and try again.`
      : 'Sorry, this product is out of stock.'
  }
  return MESSAGES[code] ?? FALLBACK
}
