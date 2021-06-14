import InsureeMainMenu from "./components/InsureeMainMenu";
import { CreatePage } from "./components/CreatePage";
import { FamiliesPage } from "./components/FamiliesPage";
import { InsureesPage } from "./components/InsureesPage";
import { CappedItemServicePage } from "./components/CappedItemServicePage";
import { ProfilePage } from "./components/ProfilePage";
import Enquiry from "./components/Enquiry";
import InsureePicker from "./pickers/InsureePicker";
import InsureeRelationPicker from "./pickers/InsureeRelationPicker";
import InsureeChfIdPicker from "./pickers/InsureeChfIdPicker";
import InsureeGenderPicker from "./pickers/InsureeGenderPicker";
import InsureeAvatar from "./components/InsureeAvatar";
import InsureeFamilySummary from "./components/InsureeFamilySummary";
import InsureeCappedItemServiceLink from "./components/InsureeCappedItemServiceLink";
import InsureeProfileLink from "./components/InsureeProfileLink";
import InsureeSummary from "./components/InsureeSummary";
import InsureeFirstServicePoint from "./components/InsureeFirstServicePoint";
import Relation from "./components/Relation";
import messages_en from "./translations/en.json";
import reducer from "./reducer";

const DEFAULT_CONFIG = {
  "translations": [{ key: 'en', messages: messages_en }],
  "reducers": [{ key: 'insuree', reducer }],  
  "refs": [
    {key: "insuree.InsureePicker", ref: InsureePicker },
    {key: "insuree.InsureeChfIdPicker", ref: InsureeChfIdPicker },
    {key: "insuree.InsureePicker.projection", ref: ["id", "chfId", "lastName", "otherNames"] },
    {key: "insuree.InsureeGenderPicker", ref: InsureeGenderPicker },
    {key: "insuree.InsureeRelationPicker", ref: InsureeRelationPicker },
    {key: "insuree.Relation", ref: Relation },

    {key: "insuree.Avatar", ref: InsureeAvatar },
    {key: "insuree.Summary", ref: InsureeSummary },
    {key: "insuree.FirstServicePoint", ref: InsureeFirstServicePoint },
    {key: "insuree.FamilySummary", ref: InsureeFamilySummary },
    {key: "insuree.ProfileLink", ref: InsureeProfileLink },
    {key: "insuree.CappedItemServiceLink", ref: InsureeCappedItemServiceLink },
  ],
  "core.Router": [
    { path: "insuree/create", component: CreatePage },
    { path: "insuree/families", component: FamiliesPage },
    { path: "insuree/insurees", component: InsureesPage },
    { path: "insuree/cappedItemService", component: CappedItemServicePage },
    { path: "insuree/profile", component: ProfilePage },
  ],
  "core.AppBar": [Enquiry],
  "core.MainMenu": [InsureeMainMenu],
  "insuree.InsureeSummaryAvatar": [InsureeAvatar],
  "insuree.InsureeSummaryExt": [InsureeFirstServicePoint],
}

export const InsureeModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}

