export default function Dropdown({state, label, list, selected = 0, changeAction = null}: 
                                 {state: boolean, 
                                  label: string, 
                                  selected?: number
                                  list: { value: number, 
                                          title: string }[],                                 
                                  changeAction: any }): JSX.Element {
        
    return (
        <div>
            <label>{label}: </label>
            <select 
              onChange={changeAction}
              disabled={state} 
              value={selected}             
            >
                {
                    list.map((item: { value: number, title: string }, index: number) => {                          
                        return <option key={item.value} value={item.value}>{item.title}</option>                        
                    })
                }                           
            </select>
        </div>   
    );
}