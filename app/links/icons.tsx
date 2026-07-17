import {
  FaSuitcase,
  FaXTwitter,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaGlobe,
  FaChartLine,
  FaRocket,
} from "react-icons/fa6";
import { TbMailFilled } from "react-icons/tb";
import type { IconType } from "react-icons";
import type { LinkIcon } from "app/links-config";

/** Shared by the public page and the admin editor so previews always match. */
export const ICONS: Record<LinkIcon, IconType> = {
  cv: FaSuitcase,
  email: TbMailFilled,
  github: FaGithub,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  twitter: FaXTwitter,
  whatsapp: FaWhatsapp,
  globe: FaGlobe,
  chart: FaChartLine,
  rocket: FaRocket,
};
