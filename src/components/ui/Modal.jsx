// Compatibility wrapper — new code should use Dialog from ./dialog.jsx
// This keeps old imports working without breaking existing pages
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "./dialog";

const Modal = ({ isOpen, onClose, title, children, size = "md", footer, showCloseButton = true }) => {
  const maxWidths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className={maxWidths[size]}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="overflow-y-auto max-h-[65vh] pr-1">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
