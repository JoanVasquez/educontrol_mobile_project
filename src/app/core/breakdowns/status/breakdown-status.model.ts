import type { BreakdownStatus, Priority } from '../../models/breakdown.model';

export interface BreakdownStatusListItem {
  id: string;
  title: string;
  location: string;
  date: string;
  priority: Priority;
  status: BreakdownStatus;
  image: string;
}

export interface BreakdownStatusResult {
  items: BreakdownStatusListItem[];
}
