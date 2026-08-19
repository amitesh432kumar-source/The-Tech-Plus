import { createClient } from "@/lib/supabase/server";
import type { FaqItem } from "@/types/content";

export async function listPublishedFaqs(): Promise<FaqItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("faqs")
    .select("question, answer, category")
    .eq("published", true)
    .order("order_index", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    question: row.question,
    answer: row.answer,
    category: row.category as FaqItem["category"],
  }));
}

export async function listFaqsByCategory(category: FaqItem["category"]): Promise<FaqItem[]> {
  const faqs = await listPublishedFaqs();
  return faqs.filter((f) => f.category === category);
}
