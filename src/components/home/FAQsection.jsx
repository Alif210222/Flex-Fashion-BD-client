
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus} from "lucide-react";

const faqs = [
  {
    question: "How can I place an order?",
    answer:
      "Browse our collection, select your preferred product, choose your size and color, and add it to your cart. Then proceed to checkout, provide your delivery information, and confirm your order.",
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer:
      "Yes! We currently support Cash on Delivery (COD). You can pay the delivery person when your order arrives at your address.",
  },
  {
    question: "How much is the delivery charge?",
    answer:
      "Our delivery charge is ৳70 inside Dhaka and ৳130 outside Dhaka. The delivery charge is automatically added to your order during checkout.",
  },
  {
    question: "How can I track my order?",
    answer:
      "After placing an order, log in to your account and visit the My Orders section. You can check your order details and current delivery progress there.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "You can request cancellation while your order is still eligible for cancellation. Please contact our support team as soon as possible for assistance.",
  },
  {
    question: "How do I choose the right size?",
    answer:
      "Please check the available product sizes and descriptions before ordering. If you need help selecting a size, contact our support team before placing your order.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#F7F3EB] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-[1100px]">

        {/* Section Heading */}
        <div className="mb-12 text-center border p-2">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#817665]">
            Need a little help?
          </p>

          <h2 className="text-3xl font-medium tracking-tight text-[#292821] sm:text-4xl">
            Frequently asked questions
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#716B60]">
            Everything you need to know about shopping with Flex-Fashion BD.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-[800px] border p-6 border-[#c7c3bb]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="border-b border-[#DED7CA]"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-5 py-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="hidden text-xs tabular-nums text-[#A49A89] sm:block">
                      0{index + 1}
                    </span>

                    <h3 className="text-sm font-medium text-[#292821] sm:text-base">
                      {faq.question}
                    </h3>
                  </div>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DED7CA] text-[#625E56]">
                    {isOpen ? (
                      <Minus size={15} />
                    ) : (
                      <Plus size={15} />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[680px] pb-6 pl-0 text-sm leading-7 text-[#716B60] sm:pl-9">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>   
      </div>
    </section>
  );
}
