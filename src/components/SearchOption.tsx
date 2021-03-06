import { SignalQuery } from 'genome-nexus-ts-api-client/dist/generated/GenomeNexusAPIInternal';
import React from 'react';
import Highlighter from 'react-highlight-words';

import './SearchOption.css';

export enum SearchOptionType {
    GENE = 'GENE',
    ALTERATION = 'ALTERATION',
    VARIANT = 'VARIANT',
    REGION = 'REGION',
}

interface ISearchOptionProps {
    search: string | undefined;
    type: SearchOptionType;
    data: SignalQuery;
}

const GeneSearchOption: React.FunctionComponent<{
    search: string;
    data: SignalQuery;
}> = props => {
    return (
        <>
            <div>
                <Highlighter
                    searchWords={[props.search]}
                    textToHighlight={props.data.hugoSymbol}
                />
            </div>
            {props.data.description ? (
                <div className="search-option-subTitle">
                    <span>{props.data.description}</span>
                </div>
            ) : null}
        </>
    );
};

const AlterationSearchOption: React.FunctionComponent<{
    search: string;
    data: SignalQuery;
}> = props => {
    return (
        <>
            <div className={'d-flex align-items-center'}>
                <Highlighter
                    // we allow multiple keywords for variant search
                    searchWords={props.search.split(/\s+/)}
                    textToHighlight={`${props.data.hugoSymbol} ${props.data.alteration}`}
                />
            </div>
            {props.data.variant ? (
                <div className="search-option-subTitle">
                    <span>{props.data.variant}</span>
                </div>
            ) : null}
            {props.data.description ? (
                <div className="search-option-subTitle">
                    <span>{props.data.description}</span>
                </div>
            ) : null}
        </>
    );
};

const RegionSearchOption: React.FunctionComponent<{
    search: string;
    data: SignalQuery;
}> = props => {
    return (
        <>
            <div>
                <Highlighter
                    searchWords={[props.search]}
                    textToHighlight={`${props.data.region}`}
                />
            </div>
            {props.data.variant ? (
                <div className="search-option-subTitle">
                    <span>{props.data.variant}</span>
                </div>
            ) : null}
            {props.data.description ? (
                <div className="search-option-subTitle">
                    <span>{props.data.description}</span>
                </div>
            ) : null}
        </>
    );
};

const VariantSearchOption: React.FunctionComponent<{
    search: string;
    data: SignalQuery;
}> = props => {
    return (
        <>
            <div>
                <Highlighter
                    searchWords={[props.search]}
                    textToHighlight={`${props.data.variant}`}
                />
            </div>
            {props.data.region ? (
                <div className="search-option-subTitle">
                    <span>{props.data.region}</span>
                </div>
            ) : null}
            {props.data.description ? (
                <div className="search-option-subTitle">
                    <span>{props.data.description}</span>
                </div>
            ) : null}
        </>
    );
};

export const SearchOption: React.FunctionComponent<ISearchOptionProps> = props => {
    const searchKeyword = props.search ? props.search : '';
    return (
        <div className="search-option-match">
            {props.type === SearchOptionType.GENE &&
                <GeneSearchOption search={searchKeyword} data={props.data} />
            }
            {props.type === SearchOptionType.ALTERATION &&
                <AlterationSearchOption
                    search={searchKeyword}
                    data={props.data}
                />
            }
            {props.type === SearchOptionType.VARIANT &&
                <VariantSearchOption
                    search={searchKeyword}
                    data={props.data}
                />
            }
            {props.type === SearchOptionType.REGION &&
                <RegionSearchOption
                    search={searchKeyword}
                    data={props.data}
                />
            }
        </div>
    );
};
