import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  Heading1, 
  Heading2, 
  Heading3,
  List, 
  ListOrdered, 
  Quote,
  Link as LinkIcon,
  Minus,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

const ToolbarButton = ({ 
  pressed, 
  onClick, 
  disabled,
  children,
  tooltip,
}: { 
  pressed?: boolean; 
  onClick: () => void; 
  disabled?: boolean;
  children: React.ReactNode;
  tooltip?: string;
}) => (
  <Toggle
    size="sm"
    pressed={pressed}
    onPressedChange={onClick}
    disabled={disabled}
    className={cn(
      "h-8 w-8 p-0 data-[state=on]:bg-primary/20 data-[state=on]:text-primary",
      "hover:bg-muted hover:text-foreground"
    )}
    title={tooltip}
  >
    {children}
  </Toggle>
);

export const RichTextEditor = ({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  maxLength = 280,
  className,
}: RichTextEditorProps) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-4 py-3',
          'prose-headings:font-semibold prose-headings:text-foreground',
          'prose-p:text-foreground prose-p:leading-relaxed',
          'prose-strong:text-foreground prose-strong:font-semibold',
          'prose-em:text-foreground',
          'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
          'prose-ul:text-foreground prose-ol:text-foreground',
          'prose-li:text-foreground',
          '[&_*]:text-foreground'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      if (text.length <= maxLength) {
        onChange(editor.getHTML());
      }
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkUrl('');
    setLinkPopoverOpen(false);
  }, [editor, linkUrl]);

  const openLinkPopover = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setLinkPopoverOpen(true);
  };

  if (!editor) return null;

  const charCount = editor.getText().length;

  return (
    <div className={cn("rounded-lg border border-border bg-background", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-2 border-b border-border flex-wrap">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          tooltip="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          tooltip="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Headings */}
        <ToolbarButton
          pressed={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          tooltip="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          tooltip="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          tooltip="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Text Formatting */}
        <ToolbarButton
          pressed={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          tooltip="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          tooltip="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          tooltip="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          tooltip="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Lists */}
        <ToolbarButton
          pressed={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          tooltip="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          pressed={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          tooltip="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Quote & Divider */}
        <ToolbarButton
          pressed={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          tooltip="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          tooltip="Divider"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Link */}
        <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <div>
              <ToolbarButton
                pressed={editor.isActive('link')}
                onClick={openLinkPopover}
                tooltip="Add Link"
              >
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">URL</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setLink();
                    }
                  }}
                  className="flex-1"
                />
                <Button size="sm" onClick={setLink}>
                  {linkUrl ? 'Set' : 'Remove'}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Character Count */}
      <div className="flex justify-end px-4 py-2 border-t border-border">
        <span className={cn(
          "text-xs font-medium",
          charCount > maxLength * 0.9 ? "text-warning" : "text-muted-foreground",
          charCount >= maxLength && "text-destructive"
        )}>
          {charCount}/{maxLength}
        </span>
      </div>
    </div>
  );
};
