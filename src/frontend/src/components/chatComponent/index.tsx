import { ENABLE_API, ENABLE_NEW_IO_MODAL } from "@/customization/feature-flags";
import { track } from "@/customization/utils/analytics";
import { Transition } from "@headlessui/react";
import { useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import ApiModal from "../../modals/apiModal";
import IOModalOld from "../../modals/IOModal";
import IOModalNew from "../../modals/IOModal/newModal";
import ShareModal from "../../modals/shareModal";
import useFlowStore from "../../stores/flowStore";
import { useShortcutsStore } from "../../stores/shortcuts";
import { useStoreStore } from "../../stores/storeStore";
import { classNames, isThereModal } from "../../utils/utils";
import ForwardedIconComponent from "../genericIconComponent";
import { Separator } from "../ui/separator";
const IOModal = ENABLE_NEW_IO_MODAL ? IOModalNew : IOModalOld;

export default function FlowToolbar(): JSX.Element {
  const preventDefault = true;
  const [open, setOpen] = useState<boolean>(false);
  const [openCodeModal, setOpenCodeModal] = useState<boolean>(false);
  const [openShareModal, setOpenShareModal] = useState<boolean>(false);
  function handleAPIWShortcut(e: KeyboardEvent) {
    if (isThereModal() && !openCodeModal) return;
    setOpenCodeModal((oldOpen) => !oldOpen);
  }

  function handleChatWShortcut(e: KeyboardEvent) {
    if (isThereModal() && !open) return;
    if (useFlowStore.getState().hasIO) {
      setOpen((oldState) => !oldState);
    }
  }

  function handleShareWShortcut(e: KeyboardEvent) {
    if (isThereModal() && !openShareModal) return;
    setOpenShareModal((oldState) => !oldState);
  }

  const openPlayground = useShortcutsStore((state) => state.open);
  const api = useShortcutsStore((state) => state.api);
  const flow = useShortcutsStore((state) => state.flow);

  useHotkeys(openPlayground, handleChatWShortcut, { preventDefault });
  useHotkeys(api, handleAPIWShortcut, { preventDefault });
  useHotkeys(flow, handleShareWShortcut, { preventDefault });

  const hasIO = useFlowStore((state) => state.hasIO);
  const hasStore = useStoreStore((state) => state.hasStore);
  const validApiKey = useStoreStore((state) => state.validApiKey);
  const hasApiKey = useStoreStore((state) => state.hasApiKey);
  const currentFlow = useFlowStore((state) => state.currentFlow);

  useEffect(() => {
    if (open) {
      track("Playground Button Clicked");
    }
  }, [open]);

  const ModalMemo = useMemo(
    () => (
      <ShareModal
        is_component={false}
        component={currentFlow!}
        disabled={!hasApiKey || !validApiKey || !hasStore}
        open={openShareModal}
        setOpen={setOpenShareModal}
      >
        <button
          disabled={!hasApiKey || !validApiKey || !hasStore}
          className={classNames(
            "relative inline-flex h-full w-full items-center justify-center gap-[4px] bg-muted px-5 py-3 text-sm font-semibold text-foreground transition-all duration-150 ease-in-out hover:bg-background hover:bg-hover",
            !hasApiKey || !validApiKey || !hasStore
              ? "button-disable text-muted-foreground"
              : "",
          )}
          data-testid="shared-button-flow"
        >
          <ForwardedIconComponent
            name="Share3"
            className={classNames(
              "-m-0.5 -ml-1 h-6 w-6",
              !hasApiKey || !validApiKey || !hasStore
                ? "extra-side-bar-save-disable"
                : "",
            )}
          />
          Share
        </button>
      </ShareModal>
    ),
    [
      hasApiKey,
      validApiKey,
      currentFlow,
      hasStore,
      openShareModal,
      setOpenShareModal,
    ],
  );

  return (
    <>
      <Transition
        show={true}
        appear={true}
        enter="transition ease-out duration-300"
        enterFrom="translate-y-96"
        enterTo="translate-y-0"
        leave="transition ease-in duration-300"
        leaveFrom="translate-y-0"
        leaveTo="translate-y-96"
      >
        <div
          className={
            "shadow-round-btn-shadow hover:shadow-round-btn-shadow message-button-position flex items-center justify-center gap-7 rounded-sm border bg-muted shadow-md transition-all"
          }
        >
          <div className="flex">
            <div className="flex h-full w-full gap-1 rounded-sm transition-all">
              {hasIO ? (
                <IOModal open={open} setOpen={setOpen} disable={!hasIO}>
                  <div
                    data-testid="playground-btn-flow-io"
                    className="relative inline-flex w-full items-center justify-center gap-1 px-5 py-3 text-sm font-semibold transition-all duration-500 ease-in-out hover:bg-hover"
                  >
                    <ForwardedIconComponent
                      name="BotMessageSquareIcon"
                      className={"h-5 w-5 transition-all"}
                    />
                    Playground
                  </div>
                </IOModal>
              ) : (
                <div
                  className={`relative inline-flex w-full cursor-not-allowed items-center justify-center gap-1 px-5 py-3 text-sm font-semibold text-muted-foreground transition-all duration-150 ease-in-out`}
                  data-testid="playground-btn-flow"
                >
                  <ForwardedIconComponent
                    name="BotMessageSquareIcon"
                    className={"h-5 w-5 transition-all"}
                  />
                  Playground
                </div>
              )}
            </div>
            <div>
              <Separator orientation="vertical" />
            </div>
            {ENABLE_API && (
              <>
                <div className="flex cursor-pointer items-center gap-2">
                  {currentFlow && currentFlow.data && (
                    <ApiModal
                      flow={currentFlow}
                      open={openCodeModal}
                      setOpen={setOpenCodeModal}
                    >
                      <div
                        className={classNames(
                          "relative inline-flex w-full items-center justify-center gap-1 px-5 py-3 text-sm font-semibold text-foreground transition-all duration-150 ease-in-out hover:bg-hover",
                        )}
                      >
                        <ForwardedIconComponent
                          name="Code2"
                          className={"h-5 w-5"}
                        />
                        API
                      </div>
                    </ApiModal>
                  )}
                </div>
                <div>
                  <Separator orientation="vertical" />
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <div
                className={`side-bar-button ${
                  !hasApiKey || !validApiKey || !hasStore
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {ModalMemo}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </>
  );
}
