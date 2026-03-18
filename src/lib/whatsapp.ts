const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

async function sendMessage(to: string, text: string): Promise<void> {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) return;

  const phone = to.replace(/\D/g, "");
  await fetch(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: text },
      }),
    }
  );
}

export async function notifyBookingConfirmed(params: {
  clientPhone: string;
  ownerPhone: string;
  clientName: string;
  fieldName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
}) {
  const { clientPhone, ownerPhone, clientName, fieldName, date, startTime, endTime, totalPrice } = params;

  const clientMsg =
    `Booking Confirmed!\n\nField: ${fieldName}\nDate: ${date}\nTime: ${startTime} - ${endTime}\nTotal: ${totalPrice} MAD\n\nSee you on the field!`;

  const ownerMsg =
    `New Booking!\n\nClient: ${clientName}\nField: ${fieldName}\nDate: ${date}\nTime: ${startTime} - ${endTime}\nTotal: ${totalPrice} MAD`;

  await Promise.allSettled([
    sendMessage(clientPhone, clientMsg),
    sendMessage(ownerPhone, ownerMsg),
  ]);
}
