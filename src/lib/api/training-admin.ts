import { prisma } from '@/lib/prisma';
import { TrainingModuleType, TrainingPlanStatus } from '@prisma/client';

// Training Plan Management
export async function getAllTrainingPlans() {
  return prisma.trainingPlan.findMany({
    include: {
      staff: true,
      modules: {
        include: {
          progress: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function assignTrainingPlan(planId: string, staffIds: string[]) {
  const assignments = staffIds.map(staffId => ({
    staffId,
    planId,
  }));

  return prisma.$transaction(
    assignments.map(assignment =>
      prisma.trainingPlan.create({
        data: {
          ...assignment,
          status: 'ACTIVE',
          progress: 0,
        },
      })
    )
  );
}

export async function bulkUpdateModuleOrder(updates: { id: string; order: number }[]) {
  return prisma.$transaction(
    updates.map(({ id, order }) =>
      prisma.trainingPlanModule.update({
        where: { id },
        data: { order },
      })
    )
  );
}

// Content Management
export async function createModuleContent(moduleId: string, content: any) {
  return await prisma.trainingPlanModule.update({
    where: { id: moduleId },
    data: {
      content: content,
      updatedAt: new Date(),
    },
  });
}

export async function updateModuleContent(moduleId: string, content: any) {
  return await prisma.trainingPlanModule.update({
    where: { id: moduleId },
    data: {
      content: content,
      updatedAt: new Date(),
    },
  });
}

export async function getModuleContent(moduleId: string) {
  const module = await prisma.trainingPlanModule.findUnique({
    where: { id: moduleId },
    select: {
      content: true,
    },
  });
  return module?.content;
}

export async function deleteModuleContent(moduleId: string) {
  return await prisma.trainingPlanModule.update({
    where: { id: moduleId },
    data: {
      content: null,
      updatedAt: new Date(),
    },
  });
}

// Progress Tracking & Analytics
export async function getTeamProgress(teamId: string) {
  const teamMembers = await prisma.providerStaff.findMany({
    where: { teamId },
    include: {
      trainingPlans: {
        include: {
          modules: {
            include: {
              progress: true,
            },
          },
        },
      },
    },
  });

  return teamMembers.map(member => {
    const plans = member.trainingPlans;
    const totalModules = plans.reduce((acc, plan) => acc + plan.modules.length, 0);
    const completedModules = plans.reduce(
      (acc, plan) =>
        acc +
        plan.modules.filter(module =>
          module.progress.some(p => p.status === 'COMPLETED')
        ).length,
      0
    );

    return {
      staffId: member.id,
      name: member.userId,
      completionRate: totalModules ? (completedModules / totalModules) * 100 : 0,
      plansAssigned: plans.length,
      lastActivity: member.updatedAt,
    };
  });
}

export async function getTrainingInsights() {
  const [modules, progress] = await Promise.all([
    prisma.trainingPlanModule.findMany({
      include: {
        progress: true,
      },
    }),
    prisma.moduleProgress.findMany({
      include: {
        module: true,
      },
    }),
  ]);

  const moduleStats = modules.map(module => {
    const moduleProgress = module.progress;
    const completionRate =
      moduleProgress.length > 0
        ? (moduleProgress.filter(p => p.status === 'COMPLETED').length /
            moduleProgress.length) *
          100
        : 0;
    const averageScore =
      moduleProgress.reduce((acc, p) => acc + (p.score || 0), 0) /
        moduleProgress.length || 0;
    const averageTimeSpent =
      moduleProgress.reduce((acc, p) => acc + (p.timeSpent || 0), 0) /
        moduleProgress.length || 0;

    return {
      moduleId: module.id,
      name: module.name,
      type: module.type,
      completionRate,
      averageScore,
      averageTimeSpent,
      totalAttempts: moduleProgress.length,
    };
  });

  const overallStats = {
    totalModules: modules.length,
    totalProgress: progress.length,
    averageCompletionRate:
      moduleStats.reduce((acc, stat) => acc + stat.completionRate, 0) /
      moduleStats.length,
    mostChallenging: moduleStats
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 3),
    mostTimeConsuming: moduleStats
      .sort((a, b) => b.averageTimeSpent - a.averageTimeSpent)
      .slice(0, 3),
  };

  return {
    moduleStats,
    overallStats,
  };
}

// Certification Management
export async function createCertification(data: {
  name: string;
  description?: string;
  validityPeriod?: number; // in months
  requiredModules: string[];
}) {
  return prisma.certification.create({
    data: {
      ...data,
      modules: {
        connect: data.requiredModules.map(id => ({ id })),
      },
    },
  });
}

export async function issueCertification(data: {
  certificationId: string;
  staffId: string;
  issueDate: Date;
  expiryDate?: Date;
}) {
  return prisma.staffCertification.create({
    data,
  });
}

// Notification Management
export async function sendTrainingReminders() {
  const incompleteProgress = await prisma.moduleProgress.findMany({
    where: {
      status: {
        not: 'COMPLETED',
      },
      startedAt: {
        lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    },
    include: {
      staff: true,
      module: true,
    },
  });

  const notifications = incompleteProgress.map(progress => ({
    staffId: progress.staffId,
    type: 'TRAINING_REMINDER',
    message: `Don't forget to complete your "${progress.module.name}" training module.`,
    data: {
      moduleId: progress.moduleId,
      moduleName: progress.module.name,
      daysElapsed: Math.floor(
        (Date.now() - progress.startedAt.getTime()) / (24 * 60 * 60 * 1000)
      ),
    },
  }));

  return prisma.notification.createMany({
    data: notifications,
  });
} 