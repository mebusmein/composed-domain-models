
// filter
// - state
// - validation
// - sorting

import z from "zod/v4";

// as an argument to a an api call
// as the state to a form
// as an argument to a component

const PersonStatusEnum = {
    LOGGED_IN: "logged_in",
    INVITED_NOT_LOGGED_IN: "invited_not_logged_in",
    NOT_INVITED: "not_invited",
    INVITED: "invited"
} as const;

type PersonStatus = typeof PersonStatusEnum[keyof typeof PersonStatusEnum];

const CustomerRoleTypeEnum = {
    EMPLOYEE: "employee",
    ACCOUNT_MANAGER: "account_manager",
} as const;

type CustomerRoleType = typeof CustomerRoleTypeEnum[keyof typeof CustomerRoleTypeEnum];



createFilterBasis = (schema: {
    name,
    status,
    personCustomerType,
    hasEmail,
    creatorIds,
    excludedIds,
    hasCustomers,
    orderBy,
    orderDirection,
}) => {
    return (source: any) => {
        return schema.parse(source);
    }
}






const customerFilterSchema = z.object({
    orderBy: z.enum(["name", "createdAt"]).optional(),
    orderDirection: z.enum(["asc", "desc"]).optional(),
    excludedIds: z.array(z.string()).optional(),
    hasCustomers: z.boolean().optional(),
    status: z.enum(PersonStatusEnum).optional(),
    personCustomerType: z.enum(CustomerRoleTypeEnum).optional(),
    hasEmail: z.boolean().optional(),
    creatorIds: z.array(z.string()).optional(),
});

type CustomerFilter = z.infer<typeof customerFilterSchema>;

function CustomerFilterCounter(source: CustomerFilter) {
    return Object.values(source).filter(Boolean).length;
}

const dateRangeFilterPartialSchema = z.object({
    startDate: z.date().optional(),
    endDate: z.date().optional(),
});

type DateRangeFilter = z.infer<typeof dateRangeFilterPartialSchema>;


function DateRangeSelector(source: DateRangeFilter) {
    return source.startDate && source.endDate
        ? {
            startDate: source.startDate,
            endDate: source.endDate,
        }
        : undefined;
}

const workflowFilterSchema = z.object({
    excludedWorkflowIds: z.array(z.string()).optional(),
    query: z.string().optional(),
    ...dateRangeFilterPartialSchema.shape,
});

type WorkflowFilter = z.infer<typeof workflowFilterSchema>;

const ComparatorEnum = {
    Equals: 'eq',
    NotEquals: 'neq',
    GreaterThan: 'gt',
    GreaterThanOrEqual: 'gteq',
    LessThan: 'lt',
    LessThanOrEqual: 'lteq',
    In: 'in',
    NotIn: 'nin',
    Like: 'like',
    NotLike: 'not_like',
    IsNull: 'is_null',
    NotNull: 'not_null',
} as const;

type Comparator = typeof ComparatorEnum[keyof typeof ComparatorEnum];

const labelSchema = z.object({
    name: z.string(),
    description: z.string(),
    color: z.string(),
    is_protected: z.number(),
    visible_for_customers: z.boolean(),
    is_archived: z.boolean(),
    owner_Type: z.enum(OwnerTypeEnum),
    created_at: z.date(),
    updated_at: z.date(),
    id: z.string(),
});

type ZodFilterSchema<T extends z.ZodObject> = z.ZodObject<{
    [K in keyof T["shape"]]: z.ZodOptional<z.ZodObject<{
        comparator: z.ZodEnum<typeof ComparatorEnum>,
        value: T["shape"][K]
    }, z.core.$strip>>;
}>;

function createFilterSchema<T extends z.ZodObject>(schema: T): ZodFilterSchema<T> {
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const key of Object.keys(schema.shape)) {
        shape[key] = z.object({
            comparator: z.enum(ComparatorEnum),
            value: schema.shape[key]
        }).optional();
    }
    return z.object(shape) as ZodFilterSchema<T>;
}

const labelFilterSchema = z.object({
    ...createFilterSchema(z.object({
        name: z.string(),
        description: z.string(),
        created_at: z.date(),
        updated_at: z.date(),
        id: z.string(),
    })).shape,
    query: z.string().optional(),
});

type LabelFilter = z.infer<typeof labelFilterSchema>;

const testFilter: LabelFilter = {
    name: {
        comparator: ComparatorEnum.Like,
        value: "%test%",
    },
    query: "test",
}

labelFilterSchema.parse(testFilter);