import React from 'react';
import classNames from 'classnames';

import { InfoButton } from 'ui/Button/InfoButton';

import './FormField.scss';

export const FormSectionHeader: React.FC = ({ children }) => (
    <div className="FormSectionHeader flex-row">
        <span>{children}</span>
        <hr />
    </div>
);

export type StringOrRender = string | (() => React.ReactNode);

export interface IFormFieldProps {
    stacked?: boolean;
    required?: boolean;
    label?: StringOrRender;
    help?: StringOrRender;
    error?: StringOrRender;
}
export const FormField: React.FunctionComponent<IFormFieldProps> = ({
    children,
    stacked,
    label,
    help,
    required,
    error,
}) => {
    const labelDOM = label ? (
        <>
            <FormFieldLabelSection>
                {typeof label === 'function' ? label() : label}
            </FormFieldLabelSection>
            {stacked ? <div className="break-flex" /> : null}
        </>
    ) : null;

    const helpDOM = help ? (
        <FormFieldHelpSection>
            {typeof help === 'function' ? help() : help}
        </FormFieldHelpSection>
    ) : null;

    const errorDOM = error ? (
        <FormFieldErrorSection>
            {typeof error === 'function' ? error() : error}
        </FormFieldErrorSection>
    ) : null;

    const requiredIndicator = required ? (
        <i className="FormFieldRequired">*Required</i>
    ) : null;

    // If user uses props to supply label, then auto wrap children to be
    // in input section
    const contentDOM =
        labelDOM || helpDOM || errorDOM ? (
            <FormFieldInputSection>
                {children}
                {errorDOM}
            </FormFieldInputSection>
        ) : (
            children
        );

    return (
        <div
            className={classNames({
                FormField: true,
                'FormField-stacked': stacked,
            })}
        >
            {labelDOM}
            {contentDOM}
            {helpDOM}
            {requiredIndicator}
        </div>
    );
};

const FormFieldLabelSection: React.FunctionComponent = ({ children }) => {
    return <div className="FormFieldLabelSection">{children}</div>;
};

export const FormFieldInputSectionRowGroup: React.FunctionComponent = ({
    children,
}) => {
    return <div className="FormFieldInputSectionRowGroup">{children}</div>;
};

export const FormFieldInputSectionRow: React.FunctionComponent = ({
    children,
}) => {
    return <div className="FormFieldInputSectionRow">{children}</div>;
};

export const FormFieldInputSection: React.FunctionComponent = ({
    children,
}) => {
    return <div className="FormFieldInputSection">{children}</div>;
};

export const FormFieldHelpSection: React.FunctionComponent = ({ children }) => {
    return (
        <div className="FormFieldHelpSection flex-center">
            <InfoButton
                layout={['bottom', 'right']}
                popoverClassName="FormFieldHelpSection"
            >
                {children}
            </InfoButton>
        </div>
    );
};

export const FormFieldErrorSection: React.FunctionComponent = ({
    children,
}) => {
    return <div className="FormFieldErrorSection">{children}</div>;
};
