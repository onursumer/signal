import {action, computed, makeObservable, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from 'react';

import {IExtendedSignalMutation} from "cbioportal-utils";
import MutationMapper from "../components/MutationMapper";
import {DataStatus} from "../store/DataStatus";
import EnsemblGeneStore from "../store/EnsemblGeneStore";
import {fetchExtendedMutationsByGene} from "../util/MutationDataUtils";
import {loaderWithText} from "../util/StatusHelper";

interface IGeneProps
{
    hugoSymbol: string;
    cancerTypes?: string[];
    mutationStatuses?: string[];
}

@observer
class Gene extends React.Component<IGeneProps>
{
    @observable
    private signalMutations: IExtendedSignalMutation[] = [];

    @observable
    private signalStatus: DataStatus = 'pending';

    constructor(props: IGeneProps) {
        super(props);
        makeObservable(this);
    }

    @computed get loader() {
        return loaderWithText("Fetching alterations...");
    }
    
    @computed
    private get hugoSymbol() {
        return this.props.hugoSymbol;
    }

    @computed
    private get geneStore() {
        return new EnsemblGeneStore(this.hugoSymbol);
    }

    @computed
    private get isLoading() {
        // here we force access to each observable field so that mobx behaves as desired
        const isPending = this.signalStatus === 'pending';
        return this.geneStore.ensemblGeneDataStatus === "pending" || isPending;
    }

    public render()
    {
        return (
            <div
                style={{
                    fontSize: "0.95rem",
                    paddingBottom: "1.5rem",
                }}
            >
                {
                    this.isLoading ?
                        this.loader :
                        <MutationMapper
                            hugoSymbol={this.hugoSymbol}
                            data={this.signalMutations}
                            ensemblGene={this.geneStore.ensemblGeneData}
                            cancerTypes={this.props.cancerTypes}
                            mutationStatuses={this.props.mutationStatuses}
                        />
                }
            </div>
        );
    }

    // TODO move data fetching and processing into MutationStore
    public componentDidMount()
    {
        fetchExtendedMutationsByGene(this.hugoSymbol)
            .then(this.handleSignalDataLoad)
            .catch(this.handleSignalDataError);
    }

    @action.bound
    private handleSignalDataLoad(mutations: IExtendedSignalMutation[])
    {
        this.signalStatus = 'complete';       
        this.signalMutations = mutations;
    }

    @action.bound
    private handleSignalDataError(reason: any) {
        this.signalStatus = 'error';
    }
}

export default Gene;
