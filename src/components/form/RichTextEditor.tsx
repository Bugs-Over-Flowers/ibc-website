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
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";

interface RichTextEditorProps {
  label?: string;
  description?: string;
  className?: string;
  placeholder?: string;
}

function RichTextEditor({
  label,
  description,
  className,
  placeholder = "Enter description...",
}: RichTextEditorProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: field.state.value ?? "",
    onUpdate: ({ editor }) => {
      field.handleChange(editor.getHTML());
    },
    onBlur: () => {
      field.handleBlur();
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <Field className={cn("grid gap-2", className)} data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <div
        className={cn(
          "rounded-md border border-input bg-background shadow-sm",
          isInvalid && "border-destructive ring-1 ring-destructive",
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-input border-b bg-muted/50 px-2 py-1">
          <ButtonGroup>
            <Button
              aria-label="Bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
              size="sm"
              variant={editor.isActive("bold") ? "secondary" : "ghost"}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              size="sm"
              variant={editor.isActive("italic") ? "secondary" : "ghost"}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </ButtonGroup>

          <ButtonGroupSeparator orientation="vertical" />

          <ButtonGroup>
            <Button
              aria-label="Heading 1"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              size="sm"
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
              variant={
                editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"
              }
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </ButtonGroup>

          <ButtonGroupSeparator orientation="vertical" />

          <ButtonGroup>
            <Button
              aria-label="Bullet List"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              size="sm"
              variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Ordered List"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              size="sm"
              variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        </div>
        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

export default RichTextEditor;
