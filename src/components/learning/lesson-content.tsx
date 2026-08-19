import { FileText, Link as LinkIcon, PlayCircle } from "lucide-react";

function toEmbedUrl(url: string) {
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}

export function LessonContent({
  contentType,
  contentUrl,
  contentText,
}: {
  contentType: string;
  contentUrl: string | null;
  contentText: string | null;
}) {
  if (contentType === "video" && contentUrl) {
    const embedUrl = toEmbedUrl(contentUrl);
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Lesson video"
          />
        ) : (
          <video src={contentUrl} controls className="size-full" />
        )}
      </div>
    );
  }

  if (contentType === "pdf" && contentUrl) {
    return (
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border">
        <iframe src={contentUrl} className="size-full" title="Lesson PDF" />
      </div>
    );
  }

  if (contentType === "external" && contentUrl) {
    return (
      <a
        href={contentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-6 hover:bg-muted"
      >
        <LinkIcon className="size-5 text-[var(--brand-blue)]" />
        <span className="text-sm font-medium">Open external resource</span>
      </a>
    );
  }

  if (contentType === "text" && contentText) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="prose prose-sm max-w-none whitespace-pre-line text-foreground">
          {contentText}
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 text-center">
      <PlayCircle className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Content for this lesson hasn&apos;t been uploaded yet.
      </p>
      {contentType === "download" && <FileText className="sr-only" />}
    </div>
  );
}
