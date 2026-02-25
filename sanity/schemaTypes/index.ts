import profile from "./profile";
import project from "./project";
import experience from "./experience";
import skill from "./skill";
import organization from "./organization";
import certificate from "./certificate";

export const schemaTypes = [profile, project, experience, skill, organization, certificate];

export const schema = {
  types: schemaTypes,
};