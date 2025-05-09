import { skillService } from '../service';

/**
 * Hook để cung cấp truy cập đến SkillService
 */
export const useSkillService = () => {
  return skillService;
}; 