
import { useNavigate, useParams } from "react-router-dom";
import AllContacts from "./AllContacts";
import ContactDetail from "../ContactDetail";
import { useContext } from "react";
import { PageContext } from "../../context/pageContext";

export default function Contactpage() {

  const { id } = useParams()
  const { enteredEmail } = useContext(PageContext)



  if (id || enteredEmail) {
    return <ContactDetail />
  }



  return (
    <AllContacts />
  )
}


