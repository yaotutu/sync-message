import { PrismaClient } from '@prisma/client';
import { CreateTemplateInput, MessageTemplate, TemplateListResponse, TemplateResponse, UpdateTemplateInput, ValidateMessageResult } from '../types/template';

// 使用全局单例模式
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export class TemplateService {
    private static instance: TemplateService;
    private prisma: PrismaClient;

    private constructor() {
        this.prisma = prisma;
    }

    public static getInstance(): TemplateService {
        if (!TemplateService.instance) {
            TemplateService.instance = new TemplateService();
        }
        return TemplateService.instance;
    }

    async createTemplate(adminId: string, input: CreateTemplateInput): Promise<TemplateResponse> {
        try {
            // 检查 appName 是否已存在
            const existingTemplate = await this.prisma.messageTemplate.findUnique({
                where: { appName: input.appName }
            });

            if (existingTemplate) {
                return {
                    success: false,
                    message: '该应用名称已存在模板'
                };
            }

            // 创建模板和规则
            const template = await this.prisma.messageTemplate.create({
                data: {
                    appName: input.appName,
                    helpDoc: input.helpDoc,
                    createdBy: adminId,
                    rules: {
                        create: input.rules.map((rule, index) => ({
                            ...rule,
                            order: rule.order ?? index
                        }))
                    }
                },
                include: {
                    rules: {
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            });

            return {
                success: true,
                message: '模板创建成功',
                data: {
                    template
                }
            };
        } catch (error) {
            console.error('创建模板失败:', error);
            return {
                success: false,
                message: '创建模板失败'
            };
        }
    }

    async updateTemplate(adminId: string, input: UpdateTemplateInput): Promise<TemplateResponse> {
        try {
            // 检查模板是否存在且属于该管理员
            const existingTemplate = await this.prisma.messageTemplate.findFirst({
                where: {
                    id: input.id,
                    createdBy: adminId
                }
            });

            if (!existingTemplate) {
                return {
                    success: false,
                    message: '模板不存在或无权限修改'
                };
            }

            // 如果更新 appName，检查是否与其他模板冲突
            if (input.appName && input.appName !== existingTemplate.appName) {
                const nameConflict = await this.prisma.messageTemplate.findUnique({
                    where: { appName: input.appName }
                });

                if (nameConflict) {
                    return {
                        success: false,
                        message: '该应用名称已被使用'
                    };
                }
            }

            // 开始事务更新
            const updatedTemplate = await this.prisma.$transaction(async (tx) => {
                // 如果提供了新的规则，先删除旧规则
                if (input.rules) {
                    await tx.messageRule.deleteMany({
                        where: { templateId: input.id }
                    });
                }

                // 更新模板
                return tx.messageTemplate.update({
                    where: { id: input.id },
                    data: {
                        appName: input.appName,
                        helpDoc: input.helpDoc,
                        rules: input.rules ? {
                            create: input.rules.map((rule, index) => ({
                                ...rule,
                                order: rule.order ?? index
                            }))
                        } : undefined
                    },
                    include: {
                        rules: {
                            orderBy: {
                                order: 'asc'
                            }
                        }
                    }
                });
            });

            return {
                success: true,
                message: '模板更新成功',
                data: {
                    template: updatedTemplate
                }
            };
        } catch (error) {
            console.error('更新模板失败:', error);
            return {
                success: false,
                message: '更新模板失败'
            };
        }
    }

    async deleteTemplate(adminId: string, templateId: string): Promise<TemplateResponse> {
        try {
            // 检查模板是否存在且属于该管理员
            const template = await this.prisma.messageTemplate.findFirst({
                where: {
                    id: templateId,
                    createdBy: adminId
                }
            });

            if (!template) {
                return {
                    success: false,
                    message: '模板不存在或无权限删除'
                };
            }

            await this.prisma.messageTemplate.delete({
                where: { id: templateId }
            });

            return {
                success: true,
                message: '模板删除成功'
            };
        } catch (error) {
            console.error('删除模板失败:', error);
            return {
                success: false,
                message: '删除模板失败'
            };
        }
    }

    async listTemplates(adminId: string): Promise<TemplateListResponse> {
        try {
            const templates = await this.prisma.messageTemplate.findMany({
                where: { createdBy: adminId },
                include: {
                    rules: {
                        orderBy: {
                            order: 'asc'
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return {
                success: true,
                data: {
                    templates
                }
            };
        } catch (error) {
            console.error('获取模板列表失败:', error);
            return {
                success: false,
                message: '获取模板列表失败'
            };
        }
    }

    async getTemplateByAppName(appName: string): Promise<TemplateResponse> {
        try {
            const template = await this.prisma.messageTemplate.findUnique({
                where: { appName },
                include: {
                    rules: {
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            });

            if (!template) {
                return {
                    success: false,
                    message: '模板不存在'
                };
            }

            return {
                success: true,
                data: {
                    template
                }
            };
        } catch (error) {
            console.error('获取模板失败:', error);
            return {
                success: false,
                message: '获取模板失败'
            };
        }
    }

    validateMessage(template: MessageTemplate, message: string): ValidateMessageResult {
        const failedRules = [];

        for (const rule of template.rules) {
            const pattern = rule.pattern;
            const isValid = rule.ruleType === 'CONTAINS'
                ? message.includes(pattern)
                : !message.includes(pattern);

            if (!isValid) {
                failedRules.push(rule);
            }
        }

        return {
            isValid: failedRules.length === 0,
            failedRules,
            message: failedRules.length > 0
                ? `消息不符合规则: ${failedRules.map(r => r.description || `${r.ruleType === 'CONTAINS' ? '必须包含' : '不能包含'} "${r.pattern}"`).join(', ')}`
                : undefined
        };
    }
} 