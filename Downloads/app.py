import streamlit as st
import pandas as pd
from io import BytesIO

st.title("🧾 Actions Report Reorderer")
st.write("Upload your Bitwave actions report to reorder it based on processing logic.")

uploaded_file = st.file_uploader("Choose a CSV file", type="csv")

if uploaded_file:
    df = pd.read_csv(uploaded_file)
    
    # Show preview
    st.subheader("Original Data (First 10 rows)")
    st.dataframe(df.head(10))

    # Ensure timestamp column is parsed
    df['timestamp_parsed'] = pd.to_datetime(df.iloc[:, 3], errors='coerce')

    # Sort by timestamp first
    df.sort_values(by='timestamp_parsed', inplace=True)

    # Group by (inventory, asset)
    inventory_col = df.columns[28]
    asset_col = df.columns[9]
    adj_col = df.columns[11]
    balance_col = df.columns[12]
    action_col = df.columns[4]

    reordered_rows = []

    for (inventory, asset), group in df.groupby([inventory_col, asset_col]):
        group = group.copy()
        reordered = []

        # Use greedy match of balance transitions
        while not group.empty:
            if not reordered:
                # Start with row where balance == assetUnitAdj (first balance)
                if 'buy' in group[action_col].values:
                    start = group[group[action_col] == 'buy'][group[balance_col] == group[adj_col]].head(1)
                else:
                    start = group.head(1)
            else:
                prev_row = reordered[-1]
                prev_balance = prev_row[balance_col]
                action = prev_row[action_col]
                if action == 'buy':
                    match = group[group[balance_col] == prev_balance + group[adj_col]]
                else:
                    match = group[group[balance_col] == prev_balance - group[adj_col]]
                start = match.head(1)

            if not start.empty:
                reordered.append(start.iloc[0])
                group = group.drop(start.index)
            else:
                # Fallback: just append next if match not found
                reordered.append(group.iloc[0])
                group = group.iloc[1:]

        reordered_rows.extend(reordered)

    final_df = pd.DataFrame(reordered_rows)

    st.subheader("Reordered Data (First 10 rows)")
    st.dataframe(final_df.head(10))

    # Create download button
    output = BytesIO()
    final_df.drop(columns=["timestamp_parsed"]).to_csv(output, index=False)
    st.download_button("Download Reordered CSV", output.getvalue(), "reordered_actions_report.csv", "text/csv")

