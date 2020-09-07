// Тип для отображения данных в MyMultiSelect
export type Option = {
    value: number,
    label: string,
}

// Объект события изменения списка
export type MyMultiSelectListEvent = {
    id: string,
    value: number,
    label: string,
}

// Объект события изменения запроса
export type MyMultiSelectInputEvent = {
    id: string,
    value: string,
}