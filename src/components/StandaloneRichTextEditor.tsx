"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

interface StandaloneRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  showHeadingTools?: boolean;
  showListTools?: boolean;
}

function StandaloneRichTextEditor({
  value,
  onChange,
  placeholder = "Enter message...",
  className,
  showHeadingTools = true,
  showListTools = true,
}: StandaloneRichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] w-full bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getHTML();

    // Only sync when external state actually differs from the editor state.
    if (value === currentContent) return;

    // Avoid onUpdate feedback loops when syncing external state into TipTap.
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background shadow-sm",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-input border-b bg-muted/50 px-2 py-1">
        <ButtonGroup>
          <Button
            aria-label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Italic className="h-4 w-4" />
          </Button>
        </ButtonGroup>

        {showHeadingTools ? (
          <ButtonGroupSeparator orientation="vertical" />
        ) : null}

        {showHeadingTools ? (
          <ButtonGroup>
            <Button
              aria-label="Heading 1"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              size="sm"
              type="button"
              variant={
                editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"
              }
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Heading 2"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              size="sm"
              type="button"
              variant={
                editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"
              }
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Heading 3"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              size="sm"
              type="button"
              variant={
                editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"
              }
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        ) : null}

        {showListTools ? <ButtonGroupSeparator orientation="vertical" /> : null}

        {showListTools ? (
          <ButtonGroup>
            <Button
              aria-label="Bullet List"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              size="sm"
              type="button"
              variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Ordered List"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              size="sm"
              type="button"
              variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        ) : null}
      </div>
      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}

export default StandaloneRichTextEditor;
