"use client";

import { useState } from "react";
import { Button } from "@getpostflow/ui/button";

interface ImageRefinementProps {
  originalImageUrl: string;
  originalPrompt: string;
  clientName: string;
  onRefine: (feedback: string) => Promise<void>;
}

export function ImageRefinement({
  originalImageUrl,
  originalPrompt,
  clientName,
  onRefine,
}: ImageRefinementProps) {
  const [feedback, setFeedback] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refinedImageUrl, setRefinedImageUrl] = useState<string | null>(null);

  const handleRefine = async () => {
    if (!feedback.trim()) return;

    setIsRefining(true);
    try {
      await onRefine(feedback);
      // In a real implementation, this would update the image
      setRefinedImageUrl(originalImageUrl); // Placeholder
      setFeedback("");
    } catch (err) {
      console.error("Refinement failed:", err);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Image */}
        <div>
          <p className="text-sm font-medium mb-2">Original Image</p>
          <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
            <img
              src={originalImageUrl}
              alt="Original generated image"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Refined Image (if available) */}
        {refinedImageUrl && (
          <div>
            <p className="text-sm font-medium mb-2">Refined Image</p>
            <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
              <img
                src={refinedImageUrl}
                alt="Refined generated image"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Refinement Feedback */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Refinement Feedback</label>
        <textarea
          value={feedback}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
          placeholder="Describe what you'd like to change. Examples: 'Make the background warmer', 'Add more contrast', 'Adjust the composition'"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isRefining}
        />
        <p className="text-xs text-muted-foreground">
          Provide specific feedback about colors, composition, style, or other visual elements.
        </p>
      </div>

      {/* Original Prompt */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Original Generation Prompt</label>
        <div className="p-3 bg-secondary rounded-lg text-sm text-muted-foreground break-words">
          {originalPrompt}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleRefine}
          disabled={!feedback.trim() || isRefining}
          className="flex-1"
        >
          {isRefining ? "Refining..." : "Refine Image"}
        </Button>
        <Button variant="outline" onClick={() => setFeedback("")}>
          Clear
        </Button>
      </div>
    </div>
  );
}
