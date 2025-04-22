import { prisma } from '@/lib/prisma';
import { ModuleStatus, TrainingModuleType, TrainingPlanStatus } from '@prisma/client';

// Training Plan Functions
export async function createTrainingPlan(data: {
  staffId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  objectives: any[];
  budget?: number;
}) {
  return prisma.trainingPlan.create({
    data: {
      ...data,
      status: 'DRAFT',
      progress: 0,
      objectives: data.objectives as any,
    },
    include: {
      modules: true,
    },
  });
}

export async function getTrainingPlan(planId: string) {
  return prisma.trainingPlan.findUnique({
    where: { id: planId },
    include: {
      modules: {
        include: {
          progress: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });
}

export async function updateTrainingPlan(planId: string, data: {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  objectives?: any[];
  status?: TrainingPlanStatus;
  progress?: number;
  budget?: number;
}) {
  return prisma.trainingPlan.update({
    where: { id: planId },
    data,
    include: {
      modules: true,
    },
  });
}

// Training Module Functions
export async function createTrainingModule(data: {
  planId: string;
  name: string;
  description?: string;
  type: TrainingModuleType;
  duration: number;
  order: number;
  required?: boolean;
  content?: any;
}) {
  return prisma.trainingPlanModule.create({
    data: {
      ...data,
      content: data.content as any,
    },
  });
}

export async function updateTrainingModule(moduleId: string, data: {
  name?: string;
  description?: string;
  type?: TrainingModuleType;
  duration?: number;
  order?: number;
  required?: boolean;
  content?: any;
  status?: ModuleStatus;
}) {
  return prisma.trainingPlanModule.update({
    where: { id: moduleId },
    data: {
      ...data,
      content: data.content as any,
    },
  });
}

// Module Progress Functions
export async function createOrUpdateProgress(data: {
  moduleId: string;
  staffId: string;
  status: ModuleStatus;
  score?: number;
  feedback?: string;
  notes?: string;
  evidence?: any;
  timeSpent?: number;
}) {
  return prisma.moduleProgress.upsert({
    where: {
      moduleId_staffId: {
        moduleId: data.moduleId,
        staffId: data.staffId,
      },
    },
    create: {
      ...data,
      evidence: data.evidence as any,
      attempts: 1,
      startedAt: new Date(),
      completedAt: data.status === 'COMPLETED' ? new Date() : null,
    },
    update: {
      ...data,
      evidence: data.evidence as any,
      attempts: { increment: 1 },
      completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
    },
  });
}

export async function getModuleProgress(moduleId: string, staffId: string) {
  return prisma.moduleProgress.findUnique({
    where: {
      moduleId_staffId: {
        moduleId,
        staffId,
      },
    },
  });
}

export async function getStaffTrainingProgress(staffId: string) {
  return prisma.moduleProgress.findMany({
    where: { staffId },
    include: {
      module: {
        include: {
          plan: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}

// Analytics Functions
export async function getTrainingAnalytics(staffId: string) {
  const progress = await prisma.moduleProgress.findMany({
    where: { staffId },
    include: {
      module: true,
    },
  });

  const completedModules = progress.filter(p => p.status === 'COMPLETED').length;
  const totalModules = progress.length;
  const averageScore = progress.reduce((acc, p) => acc + (p.score || 0), 0) / completedModules || 0;
  const totalTimeSpent = progress.reduce((acc, p) => acc + (p.timeSpent || 0), 0);

  return {
    completedModules,
    totalModules,
    completionRate: totalModules ? (completedModules / totalModules) * 100 : 0,
    averageScore,
    totalTimeSpent,
    moduleBreakdown: progress.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<ModuleStatus, number>),
  };
} 