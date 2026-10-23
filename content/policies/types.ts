export interface PolicySection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

export interface PolicyDocument {
  /** ISO date of the last text change. */
  updatedAt: string;
  sections: PolicySection[];
}
