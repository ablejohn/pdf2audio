import { useEffect, useState } from "react";
import "../styling/message.css";

function Message(props) {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (props.message) {
      setShowMessage(true);
      const messageTimer = setTimeout(() => {
        setShowMessage(false);
      }, 4000);
      return () => {
        clearTimeout(messageTimer);
      };
    }
  }, [props.message]);

  return (
    <div className={`msg ${showMessage ? "visible" : ""}`} role="alert">
      <p>{props.message}</p>
    </div>
  );
}

export default Message;
