export type RuleType = 'CONTAINS' | 'NOT_CONTAINS';

export interface Rule {
    id: string;
    templateId: string;
    ruleType: 'CONTAINS' | 'NOT_CONTAINS';
    pattern: string;
    description: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface MessageTemplate {
    id: string;
    appName: string;
    helpDoc: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    rules: Rule[];
}

export interface CreateTemplateInput {
    appName: string;
    helpDoc: string;
    rules: Omit<Rule, 'id'>[];
}

export interface UpdateTemplateInput {
    id: string;
    appName?: string;
    helpDoc?: string;
    rules?: Omit<Rule, 'id'>[];
}

export interface TemplateResponse {
    success: boolean;
    message?: string;
    data?: {
        template?: MessageTemplate;
    };
}

export interface TemplateListResponse {
    success: boolean;
    message?: string;
    data?: {
        templates: MessageTemplate[];
    };
}

export interface ValidateMessageResult {
    isValid: boolean;
    failedRules: Rule[];
    message?: string;
} 