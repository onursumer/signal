import {
    CancerTypeFilter, DataFilter
} from "react-mutation-mapper";

import {ISignalGeneFrequencySummary, ISignalTumorTypeFrequencySummary, SignalMutationStatus} from "cbioportal-utils";
import {IExtendedSignalMutation, ISignalTumorTypeDecomposition} from "cbioportal-utils";
import { SignalMutation } from 'genome-nexus-ts-api-client';
import {PenetranceLevel} from "../model/Penetrance";

export const HUGO_SYMBOL_SEARCH_FILTER_ID = "_signalHugoSymbolSearchFilter_";
export const HUGO_SYMBOL_DROPDOWN_FILTER_ID = "_signalHugoSymbolDropdownFilter_";
export const CANCER_TYPE_FILTER_ID = "_signalCancerTypeFilter_";
export const MUTATION_STATUS_FILTER_ID = "_signalMutationStatusFilter_";
export const PROTEIN_IMPACT_TYPE_FILTER_ID = "_signalProteinImpactTypeFilter_";
export const PENETRANCE_FILTER_ID = "_signalPenetranceFilter_"
export const HUGO_SYMBOL_FILTER_TYPE = "signalHugoSymbol";
export const MUTATION_STATUS_FILTER_TYPE = "signalMutationStatus";
export const MUTATION_COUNT_FILTER_TYPE = "signalMutationCount";
export const CANCER_TYPE_IGNORE_MUTATION_STATUS_FILTER_TYPE = "signalCancerTypeIgnoreMutationStatus";
export const PENETRANCE_FILTER_TYPE = "signalPenetrance"

export type MutationStatusFilter = DataFilter<SignalMutationStatus>;
export type MutationCountFilter = DataFilter<number>; // TODO this should be an interval not a single number
export type PenetranceFilter = DataFilter<PenetranceLevel>;
export type HugoSymbolFilter = DataFilter<string>;

export function applyCancerTypeFilter(filter: CancerTypeFilter, mutation: SignalMutation)
{
    return mutation.countsByTumorType.find(c =>
        filter.values.find(v =>
            v.length > 0 &&
            c.variantCount > 0 &&
            c.tumorType.toLowerCase().includes(v.toLowerCase())) !== undefined) !== undefined
}

export function applyGeneFrequencySummaryPenetranceFilter(filter: PenetranceFilter, geneFrequencySummary: ISignalGeneFrequencySummary)
{
    return filter.values
        .map(v => geneFrequencySummary.penetrance.map(p => p.toLowerCase()).includes(v.toLowerCase()))
        .includes(true);
}

export function isKnownTumorType(tumorType: string) {
    return !tumorType.toLowerCase().includes("unknown") && !tumorType.toLowerCase().includes("other");
}

export function applyTumorTypeFrequencySummaryCancerTypeFilter(filter: CancerTypeFilter, tumorTypeFrequencySummary: ISignalTumorTypeFrequencySummary)
{
    return filter.values
        .map(v => tumorTypeFrequencySummary.tumorType.toLowerCase().includes(v.toLowerCase()))
        .includes(true);
}

export function applyGeneFrequencySummaryHugoSymbolFilter(filter: HugoSymbolFilter, geneFrequencySummary: ISignalGeneFrequencySummary)
{
    return filter.values
        .map(v => geneFrequencySummary.hugoSymbol.toLowerCase().includes(v.toLowerCase()))
        .includes(true);
}

export function applyMutationStatusFilter(filter: MutationStatusFilter,
                                          mutation: IExtendedSignalMutation,
                                          biallelicFrequency: number|null = mutation.biallelicPathogenicGermlineFrequency)
{
    return filter.values.map(v => {
        let match = false;

        const isGermline = mutation.mutationStatus.toLowerCase().includes(
            SignalMutationStatus.GERMLINE.toLowerCase());
        const isPathogenicGermline = isGermline && mutation.pathogenic === "1";
        const isBenignGermline = isGermline && !isPathogenicGermline;
        const isSomatic = mutation.mutationStatus.toLowerCase().includes(
            SignalMutationStatus.SOMATIC.toLowerCase());

        if (v.length > 0)
        {
            if (v === SignalMutationStatus.SOMATIC) {
                match = isSomatic;
            }
            else if (v === SignalMutationStatus.GERMLINE) {
                match = isGermline;
            }
            else if (v === SignalMutationStatus.BENIGN_GERMLINE) {
                match = isBenignGermline;
            }
            else if (v === SignalMutationStatus.PATHOGENIC_GERMLINE) {
                match = isPathogenicGermline;
            }
            else if (v === SignalMutationStatus.BIALLELIC_PATHOGENIC_GERMLINE) {
                match = isPathogenicGermline && biallelicFrequency !== null && biallelicFrequency > 0;
            }
        }

        return match;
    }).includes(true);
}

export function containsCancerType(filter: CancerTypeFilter | undefined, cancerType: string)
{
    return !filter || filter.values.find(v => cancerType.toLowerCase().includes(v.toLowerCase())) !== undefined;
}

export function matchesMutationStatus(filter: MutationStatusFilter | undefined,
                                      mutation: IExtendedSignalMutation,
                                      tumorTypeDecomposition: ISignalTumorTypeDecomposition)
{
    return !filter || applyMutationStatusFilter(filter, mutation, tumorTypeDecomposition.biallelicRatio);
}

export function findCancerTypeFilter(dataFilters: DataFilter[])
{
    return dataFilters.find(f => f.id === CANCER_TYPE_FILTER_ID);
}

export function findMutationStatusFilter(dataFilters: DataFilter[])
{
    return dataFilters.find(f => f.id === MUTATION_STATUS_FILTER_ID);
}

export function findMutationTypeFilter(dataFilters: DataFilter[])
{
    return dataFilters.find(f => f.id === PROTEIN_IMPACT_TYPE_FILTER_ID);
}

export function getDefaultMutationStatusFilterValues() {
    return [
        SignalMutationStatus.SOMATIC,
        SignalMutationStatus.PATHOGENIC_GERMLINE
    ];
}

export function updateDataFilters(
    dataFilters: DataFilter[],
    dataFilterId: string,
    dataFilter?: DataFilter
): DataFilter[]
{
    // all other filters except the current filter with the given data filter id
    const otherFilters = dataFilters.filter(
        (f: DataFilter) => f.id !== dataFilterId
    );

    if (!dataFilter) {
        // if no new filter is provided, just remove the existing one
        return otherFilters;
    } else {
        // update data filters with the new one
        return [...otherFilters, dataFilter];
    }
}
