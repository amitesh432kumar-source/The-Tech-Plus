import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/payments/checkout-button";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CourseMobileCta({
  courseId,
  price,
  isAuthenticated,
  isEnrolled,
  courseSlug,
}: {
  courseId: string;
  price: number;
  isAuthenticated: boolean;
  isEnrolled: boolean;
  courseSlug: string;
}) {
  return (
    <div className="glass fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-border px-4 py-3 lg:hidden">
      <span className="text-lg font-bold">{formatPrice(price)}</span>
      {isEnrolled ? (
        <Button disabled>Enrolled</Button>
      ) : isAuthenticated ? (
        <CheckoutButton itemType="course" itemId={courseId} buttonLabel="Enroll Now" showCoupon={false} />
      ) : (
        <Button render={<Link href={`/login?next=/courses/${courseSlug}`} />}>
          Login to Enroll
        </Button>
      )}
    </div>
  );
}
