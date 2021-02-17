import React, { FC, useState } from "react";
import { useApps } from "../../hooks/useApps";
import { AppObj, CustomModel } from "../../interfaces";
import './apdexBoard.css';
import Modal from "../modal/modal";


const USER = 'averylongemailaddress@companyname.com';

/**
 * I chose general names for the components because the app looks like a filter
 * that filters by host, then for "future" filters we can easily reuse the same components
 */
const FILTERED_BY = 'Apps by Host';

type ItemListProps = {
    item: CustomModel;
    onShowInformation: Function;
}
const ItemList: FC<ItemListProps> = ({ item, onShowInformation }) => {
    if (!item.list.length) return <>No Apps available</>
    const topElements = item.list.slice(0, 5);
    return <>
        {
            topElements.map((el: AppObj) => {
                return <React.Fragment key={`${item.id}-${el.id}`}>
                    <div className="first-column" >{el.apdex}</div>
                    <div
                        style={{cursor: 'pointer'}}
                        onClick={() => onShowInformation(el)}
                    >{`${el.name} - ${el.contributors.join(', ')}`}</div>
                </React.Fragment>
            })
        }
    </>
}

type CardListProps = {
    data: Array<CustomModel>;
    onShowInformation: Function;
};
const CardList: FC<CardListProps> = ({ data, onShowInformation }) => {
    return <>
        {
            data.map((item: CustomModel) => {
                return <div key={item.id} className="item-list">
                    <div className="title">
                        {item.name}
                    </div>
                    <div className="body">
                        <ItemList item={item} onShowInformation={onShowInformation} />
                    </div>
                </div>
            })
        }
    </>;
}

export const ApdexBoard = () => {
    const [showAsList, setShowAsList] = useState<boolean>(false);
    const [infoModal, setInfoModal] = useState<any>({ show: false });
    const { data, loading }: { data: Array<CustomModel>, loading: boolean} = useApps({ criteria: 'HOST' });
    const typeLayout = showAsList ? 'list-container' : 'list-container grid';

    const onChangeLayout = () => setShowAsList((prevState) => !prevState);
    const onShowInformation = (info: AppObj) => setInfoModal({...info, show: true});
    

    return <>
        <div className="container">
            <div className="info-board">
                <div className="title">{FILTERED_BY}</div>
                <div className="user">for user {USER}</div>
                <div><input checked={showAsList} onChange={onChangeLayout} type="checkbox" />Show as list</div>
            </div>
            <div className={typeLayout}>
                {
                    !loading ?
                        (<CardList data={data} onShowInformation={onShowInformation} />)
                        : (<div className="loading" />)
                }
            </div>
        </div>
        <Modal title={infoModal.name} onClose={() => setInfoModal({ show: false })} show={ infoModal.show }>
            <p>{`Latest version: ${ infoModal.version }`}</p>
        </Modal>
    </>

}