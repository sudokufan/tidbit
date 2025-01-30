import {useState} from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Accordion,
  AccordionItem,
} from "@heroui/react";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (username: string) => void;
}

export default function UsernameModal({
  isOpen,
  onClose,
  onSave,
}: UsernameModalProps) {
  const [username, setUsername] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      size="full"
      isDismissable={false}
      isKeyboardDismissDisabled
      onClose={onClose}
      hideCloseButton
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              What's your name?
            </ModalHeader>
            <ModalBody>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name here"
              />
              <Accordion>
                <AccordionItem
                  key="1"
                  aria-label="Why do you want to know my name?"
                  title="Why do you want to know my name?"
                >
                  <div>
                    What you enter here is what will appear next to your Tidbits
                    when you post. Most people use their first or full name. It
                    exists for display purposes only and you can change it at
                    any time on your Profile page.
                  </div>
                </AccordionItem>
              </Accordion>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={() => onSave(username)}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
