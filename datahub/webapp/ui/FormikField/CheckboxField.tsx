import React from 'react';
import { useField } from 'formik';
import { Checkbox, ICheckboxProps } from 'ui/Form/Checkbox';

export interface ICheckboxFieldProps extends ICheckboxProps {
    name: string;
}

export const CheckboxField: React.FC<ICheckboxFieldProps> = ({
    name,
    ...checkboxProps
}) => {
    const [_, meta, helpers] = useField(name);
    return (
        <Checkbox
            {...checkboxProps}
            value={checkboxProps.value ?? meta.value}
            onChange={checkboxProps.onChange ?? helpers.setValue}
        />
    );
};
